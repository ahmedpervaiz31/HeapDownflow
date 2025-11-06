from rest_framework import serializers
from .models import User, Question, Answer, Comment, Tag
from django.contrib.auth.password_validation import validate_password
from django.db.models import Sum

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class AnswerSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    # Make `question` a writable field
    question = serializers.PrimaryKeyRelatedField(queryset=Question.objects.all())

    class Meta:
        model = Answer
        fields = ['id', 'author', 'question', 'body', 'is_accepted', 'created_at']
        
        # `question` is no longer read_only
        read_only_fields = ['author']

class QuestionSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    
    # This field will calculate the total vote score
    vote_score = serializers.IntegerField(read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'author', 'title', 'body', 'tags', 'created_at', 
            'updated_at', 'answers', 'vote_score'
        ]

