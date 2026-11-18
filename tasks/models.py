
from django.db import models


class Task(models.Model):
    class Priority(models.TextChoices):
        LOW = "low", "Низкий"
        MEDIUM = "medium", "Средний"
        HIGH = "high", "Высокий"

    title = models.CharField(
        max_length=200,
        verbose_name="Название задачи"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Описание"
    )
    category = models.CharField(
        max_length=100,
        default="Другое",
        verbose_name="Категория"

    )


    life_category = models.ForeignKey(
    "LifeCategory",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="tasks",
    verbose_name="Сфера жизни",
    )

    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        verbose_name="Приоритет"
    )
    due_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Срок выполнения"
    )
    is_completed = models.BooleanField(
        default=False,
        verbose_name="Выполнена"
    )
    xp_reward = models.PositiveIntegerField(
        default=10,
        verbose_name="Награда XP"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Создана"
    )

    class Meta:
        ordering = ["is_completed", "-created_at"]
        verbose_name = "Задача"
        verbose_name_plural = "Задачи"

    def __str__(self):
        return self.title




class LifeCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.CharField(max_length=200, blank=True)
    color = models.CharField(max_length=7, default="#9b7bff")
    icon = models.CharField(max_length=30, default="⚡")

    class Meta:
        verbose_name = "Сфера жизни"
        verbose_name_plural = "Сферы жизни"

    def __str__(self):
        return self.name


class PlayerProfile(models.Model):
    nickname = models.CharField(max_length=50, default="Hunter")
    total_xp = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def level(self):
        return self.total_xp // 100 + 1

    @property
    def xp_in_level(self):
        return self.total_xp % 100

    def __str__(self):
        return self.nickname


class Achievement(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255)
    icon = models.CharField(max_length=30, default="🏆")
    required_xp = models.PositiveIntegerField(default=100)

    def __str__(self):
        return self.name
