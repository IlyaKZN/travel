<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { Compass } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/lib/api";

const mode = ref<"login" | "register">("login");
const email = ref("");
const password = ref("");
const nickname = ref("");
const remember = ref(false);
const router = useRouter();
const queryClient = useQueryClient();

const telegramMutation = useMutation({
  mutationFn: (initData: string) => api.telegramLogin(initData),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    router.push("/");
  },
});

const authMutation = useMutation({
  mutationFn: () =>
    mode.value === "login"
      ? api.login({ email: email.value, password: password.value, remember: remember.value })
      : api.register({
          firstName: nickname.value || email.value.split("@")[0],
          lastName: "",
          email: email.value,
          password: password.value,
        }),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    router.push("/");
  },
});

const isSubmitting = computed(() => authMutation.isPending.value || telegramMutation.isPending.value);

onMounted(() => {
  const webApp = window.Telegram?.WebApp;
  webApp?.ready();
  webApp?.expand();

  if (webApp?.initData) {
    telegramMutation.mutate(webApp.initData);
  }
});

function onSubmit(e: Event) {
  e.preventDefault();
  authMutation.mutate();
}
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__visual">
      <div class="auth__visual-logo">
        <span class="auth__logo-icon"><Compass class="icon" /></span>
        <span class="auth__logo-text">waymate</span>
      </div>
      <div>
        <h1 class="auth__visual-title">Открой дорогу,<br />поезжай вместе.</h1>
        <p class="auth__visual-desc">
          Сообщество путешественников. Маршруты, попутчики, чаты — в одном приложении.
        </p>
      </div>
      <p class="auth__copyright">© 2026 Waymate</p>
    </div>

    <div class="auth-layout__form">
      <div class="auth__form-wrap">
        <div class="auth__mobile-logo">
          <span class="auth__logo-icon auth__logo-icon--primary"><Compass class="icon" /></span>
          <span class="auth__logo-text">waymate</span>
        </div>

        <h2 class="auth__title">{{ mode === "login" ? "С возвращением" : "Создать аккаунт" }}</h2>
        <p class="auth__subtitle">
          {{ mode === "login" ? "Войди, чтобы продолжить путешествие." : "Регистрация займёт минуту." }}
        </p>

        <form class="auth__form" @submit="onSubmit">
          <input
            v-if="mode === 'register'"
            v-model="nickname"
            class="input"
            placeholder="Никнейм"
          />
          <input v-model="email" type="email" class="input" placeholder="Email или телефон" />
          <input
            v-model="password"
            type="password"
            class="input"
            placeholder="Пароль (мин. 6 символов)"
          />

          <div v-if="mode === 'login'" class="auth__row">
            <label class="auth__remember">
              <input v-model="remember" type="checkbox" /> Запомнить меня
            </label>
            <button type="button" class="auth__forgot">Забыли пароль?</button>
          </div>

          <button
            type="submit"
            class="btn btn--primary btn--block auth__submit"
            :disabled="isSubmitting"
          >
            {{
              telegramMutation.isPending.value
                ? "Входим через Telegram..."
                : authMutation.isPending.value
                ? "Подождите..."
                : mode === "login"
                  ? "Войти"
                  : "Зарегистрироваться"
            }}
          </button>
          <p v-if="authMutation.isError.value || telegramMutation.isError.value" class="auth__error">
            {{ telegramMutation.error.value?.message ?? authMutation.error.value?.message }}
          </p>
        </form>

        <p class="auth__footer">
          {{ mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? " }}
          <RouterLink v-if="mode === 'login'" to="/register" class="auth__footer-link">
            Регистрация
          </RouterLink>
          <button v-else type="button" class="auth__footer-link" @click="mode = 'login'">Войти</button>
        </p>

        <p class="auth__onboarding-link">
          <RouterLink to="/onboarding">Посмотреть онбординг</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
