from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Sum

from .models import Exam, Question, Choice, ExamResponse, TestAnswer, EssayAnswer, ExamSection
from .serializers import (
    ExamSerializer, ExamDetailSerializer, ExamTakeSerializer,
    QuestionSerializer, ChoiceSerializer,
    ExamResponseSerializer, TestAnswerSerializer, EssayAnswerSerializer,ExamSectionSerializer
)
from accounts.permissions import IsCounselor, IsStudent


# ===== Exam ViewSet =====
class ExamViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['exam_type', 'is_active', 'counselor']
    search_fields = ['title']
    ordering_fields = ['created_at', 'title']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsCounselor()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ExamDetailSerializer
        return ExamSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Exam.objects.all()
        elif user.is_counselor:
            return Exam.objects.filter(counselor=user)
        elif user.is_student and user.counselor:
            return Exam.objects.filter(counselor=user.counselor, is_active=True)
        return Exam.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(counselor=self.request.user)
    
    # ===== شروع آزمون توسط دانش‌آموز =====
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsStudent])
    def start(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        
        # چک کردن بازه زمانی
        today = timezone.now()  # ← این خط عوض شد
        if today < exam.entry_start or today > exam.entry_end:
            return Response(
                {'error': 'در حال حاضر زمان مجاز برای ورود به آزمون نیست.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # چک کردن شرکت قبلی
        response, created = ExamResponse.objects.get_or_create(
            exam=exam,
            student=user,
            defaults={'started_at': timezone.now()}
        )
        
        if response.is_finished:
            return Response(
                {'error': 'شما قبلاً این آزمون را انجام داده‌اید.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'message': 'آزمون با موفقیت شروع شد.',
            'response_id': response.id,
            'exam': ExamTakeSerializer(exam).data
        })
    
    # ===== ذخیره پاسخ تستی =====
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsStudent], url_path='answer-test')
    def answer_test(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        
        response = ExamResponse.objects.filter(
            exam=exam,
            student=user,
            finished_at__isnull=True
        ).first()
        
        if not response:
            return Response(
                {'error': 'آزمونی در حال انجام یافت نشد.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        question_id = request.data.get('question')
        choice_id = request.data.get('choice')
        
        TestAnswer.objects.update_or_create(
            response=response,
            question_id=question_id,
            defaults={'choice_id': choice_id}
        )
        
        return Response({'message': 'پاسخ با موفقیت ذخیره شد.'})
    
    # ===== ذخیره پاسخ تشریحی =====
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsStudent], url_path='answer-essay')
    def answer_essay(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        
        response = ExamResponse.objects.filter(
            exam=exam,
            student=user,
            finished_at__isnull=True
        ).first()
        
        if not response:
            return Response(
                {'error': 'آزمونی در حال انجام یافت نشد.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        question_id = request.data.get('question')
        text_answer = request.data.get('text_answer', '')
        file_answer = request.FILES.get('file_answer')
        
        answer, _ = EssayAnswer.objects.update_or_create(
            response=response,
            question_id=question_id,
            defaults={'text_answer': text_answer}
        )
        
        if file_answer:
            answer.file_answer = file_answer
            answer.save()
        
        return Response({'message': 'پاسخ تشریحی با موفقیت ذخیره شد.'})
    
    # ===== پایان آزمون =====
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsStudent], url_path='finish')
    def finish(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        
        response = ExamResponse.objects.filter(
            exam=exam,
            student=user,
            finished_at__isnull=True
        ).first()
        
        if not response:
            return Response(
                {'error': 'آزمونی در حال انجام یافت نشد.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        response.finished_at = timezone.now()
        
        # محاسبه نمره تستی
        # محاسبه درصد
        if exam.exam_type in ['test', 'mixed']:
            total_questions = exam.questions.filter(question_type='test').count()
            
            if total_questions > 0:
                correct_count = 0
                wrong_count = 0
                
                for answer in response.test_answers.all():
                    if answer.is_correct:
                        correct_count += 1
                    elif answer.choice is not None:
                        wrong_count += 1
                
                # محاسبه
                if exam.score_type == 'percentage':
                    raw_score = (correct_count * 3) - wrong_count
                    total_possible = total_questions * 3
                    percentage = (raw_score / total_possible) * 100 if total_possible > 0 else 0
                    response.total_score = round(percentage, 2)
                else:
                    total_score = 0
                    for answer in response.test_answers.all():
                        if answer.is_correct:
                            total_score += answer.question.score
                    response.total_score = total_score
            else:
                response.total_score = 0
        
        response.save()
        
        return Response({
            'message': 'آزمون با موفقیت به پایان رسید.',
            'total_score': response.total_score,
            'details': ExamResponseSerializer(response).data
        })
    
    # ===== ثبت خروج از آزمون =====
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsStudent], url_path='exit')
    def exit_exam(self, request, pk=None):
        exam = self.get_object()
        user = request.user
        
        response = ExamResponse.objects.filter(
            exam=exam,
            student=user,
            finished_at__isnull=True
        ).first()
        
        if response:
            response.exit_count += 1
            response.save()
            return Response({
                'message': 'خروج ثبت شد.',
                'exit_count': response.exit_count
            })
        
        return Response({'error': 'آزمونی یافت نشد.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # ===== نتایج آزمون (برای مشاور) =====
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsCounselor], url_path='results')
    def results(self, request, pk=None):
        exam = self.get_object()
        responses = ExamResponse.objects.filter(exam=exam)
        return Response(ExamResponseSerializer(responses, many=True).data)


# ===== Question ViewSet =====
class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsCounselor]
    
    def get_queryset(self):
        exam_id = self.kwargs.get('exam_pk')
        return Question.objects.filter(exam_id=exam_id, exam__counselor=self.request.user)
    
    def perform_create(self, serializer):
        exam = Exam.objects.get(pk=self.kwargs['exam_pk'], counselor=self.request.user)
        last_order = exam.questions.count()
        serializer.save(exam=exam, order=last_order + 1)


class ExamSectionViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSectionSerializer
    permission_classes = [permissions.IsAuthenticated, IsCounselor]
    
    def get_queryset(self):
        exam_id = self.kwargs.get('exam_pk')
        return ExamSection.objects.filter(exam_id=exam_id)
    
    def perform_create(self, serializer):
        exam = Exam.objects.get(pk=self.kwargs['exam_pk'])
        serializer.save(exam=exam)