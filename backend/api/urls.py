from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'questions', views.QuestionViewSet)
router.register(r'answers', views.AnswerViewSet)
router.register(r'tags', views.TagViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Auth endpoints
    path('auth/register/', views.RegisterView.as_view(), name='auth_register'),
    path('auth/profile/', views.get_user_profile, name='user_profile'),
]

