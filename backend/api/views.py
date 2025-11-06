from rest_framework import viewsets, generics, permissions, status
from .models import Question, Answer, Tag, User, Vote
from .serializers import QuestionSerializer, AnswerSerializer, TagSerializer, RegisterSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.db.models import Sum, Value, IntegerField 
from django.db.models.functions import Coalesce 

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request):
    """
    Get the user profile for the logged-in user.
    """
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)

class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for questions.
    Provides `list`, `create`, `retrieve`, `update`, `partial_update`, and `destroy` actions.
    """
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    queryset = Question.objects.all()
    
    def get_queryset(self):
        """
        Annotate the queryset with the sum of votes.
        """
        # Annotate each question with its vote_score
        # Coalesce ensures that if there are no votes, it returns 0 instead of None
        return Question.objects.annotate(
            vote_score=Coalesce(Sum('votes__vote_type'), Value(0), output_field=IntegerField())
        ).order_by('-created_at')

    def perform_create(self, serializer):
        # Automatically set the author to the logged-in user
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def vote(self, request, pk=None):
        """
        Allow a user to vote on a question.
        POST data should be: {"vote_type": 1} or {"vote_type": -1}
        """
        question = self.get_object()
        user = request.user
        vote_type = request.data.get('vote_type')

        if vote_type not in [1, -1]:
            return Response(
                {'error': 'Invalid vote type. Must be 1 or -1.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Check if a vote already exists
            vote = Vote.objects.get(user=user, question=question)
            
            # If the new vote is the same as the old one, delete the vote (toggle off)
            if vote.vote_type == vote_type:
                vote.delete()
                return Response({'status': 'vote removed'}, status=status.HTTP_204_NO_CONTENT)
            else:
                # If changing vote (e.g., up to down), update it
                vote.vote_type = vote_type
                vote.save()
                return Response({'status': 'vote updated'}, status=status.HTTP_200_OK)

        except Vote.DoesNotExist:
            # If no vote exists, create a new one
            Vote.objects.create(user=user, question=question, vote_type=vote_type)
            return Response({'status': 'vote created'}, status=status.HTTP_201_CREATED)

class AnswerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for answers.
    """
    queryset = Answer.objects.all().order_by('created_at')
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # The serializer will now get the `question` ID from the request data
        # We just need to set the author
        serializer.save(author=self.request.user)

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for tags. Provides `list` and `retrieve` actions.
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

