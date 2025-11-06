from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Question, Answer, Comment, Tag, Vote

# Register the custom User model
admin.site.register(User, UserAdmin)

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'created_at']
    list_filter = ['created_at', 'tags']
    search_fields = ['title', 'body']

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['question', 'author', 'is_accepted', 'created_at']
    list_filter = ['is_accepted', 'created_at']
    search_fields = ['body']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'created_at']
    list_filter = ['created_at']

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['user', 'vote_type', 'question', 'answer', 'created_at']
    list_filter = ['vote_type']

