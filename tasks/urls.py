from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, RecurringTaskViewSet

router = DefaultRouter()
router.register(r'recurring', RecurringTaskViewSet, basename='recurring-tasks')
router.register(r'', TaskViewSet, basename='tasks')

urlpatterns = router.urls
