import factory
from django.contrib.auth.models import User
from core.models import Profile, Dependent

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Faker('user_name')
    email = factory.Faker('email')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')

class ProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Profile

    user = factory.SubFactory(UserFactory)
    display_name = factory.Faker('name')

class DependentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Dependent

    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    birth_date = factory.Faker('date_of_birth')

    @factory.post_generation
    def users(self, create, extracted, **kwargs):
        if not create or not extracted:
            return
        for user in extracted:
            self.users.add(user)
