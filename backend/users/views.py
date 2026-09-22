from rest_framework.generics import RetrieveUpdateAPIView

from .serializers import UserSerializer


class CurrentUserView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
