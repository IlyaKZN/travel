<script setup lang="ts">
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { Compass, Eye, EyeOff, Check, User, Mail, Lock } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/lib/api";

const router = useRouter();
const queryClient = useQueryClient();
const showPwd = ref(false);
const agree = ref(false);
const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirm: "",
});

const pwdStrength = computed(() => {
  const p = form.value.password;
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-ZА-Я]/.test(p) && /[a-zа-я]/.test(p)) s++;
  if (/\d/.test(p) || /[^a-zA-Zа-яА-Я0-9]/.test(p)) s++;
  return s;
});

const strengthLabel = computed(
  () => ["Слишком короткий", "Слабый", "Нормальный", "Хороший", "Сильный"][pwdStrength.value],
);

const strengthBarClass = (i: number) => {
  if (i >= pwdStrength.value) return "";
  if (pwdStrength.value === 1) return "register__strength-bar--weak";
  if (pwdStrength.value === 2) return "register__strength-bar--fair";
  if (pwdStrength.value === 3) return "register__strength-bar--good";
  return "register__strength-bar--strong";
};

function isEmailOrPhone(v: string) {
  const s = v.trim();
  return /.+@.+\..+/.test(s) || /^\+?[\d\s\-()]{10,}$/.test(s);
}

const valid = computed(
  () =>
    form.value.firstName.trim().length >= 2 &&
    isEmailOrPhone(form.value.email) &&
    form.value.password.length >= 6 &&
    form.value.password === form.value.confirm &&
    agree.value,
);

const registerMutation = useMutation({
  mutationFn: () =>
    api.register({
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      email: form.value.email.trim(),
      password: form.value.password,
    }),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    router.push("/");
  },
});

function onSubmit(e: Event) {
  e.preventDefault();
  if (valid.value) registerMutation.mutate();
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
        <h1 class="auth__visual-title">Присоединяйся к<br />сообществу путешественников.</h1>
        <p class="auth__visual-desc">
          Найди попутчиков, дели расходы и открывай новые маршруты вместе.
        </p>
        <ul class="register__features">
          <li
            v-for="t in [
              'Создавай поездки и собирай команду',
              'Общайся в чатах поездок',
              'Безопасный профиль и отзывы',
            ]"
            :key="t"
            class="register__feature"
          >
            <span class="register__feature-icon"><Check class="icon icon--sm" /></span>
            {{ t }}
          </li>
        </ul>
      </div>
      <p class="auth__copyright">© 2026 Waymate</p>
    </div>

    <div class="auth-layout__form">
      <div class="register__form-wrap">
        <div class="auth__mobile-logo">
          <span class="auth__logo-icon auth__logo-icon--primary"><Compass class="icon" /></span>
          <span class="auth__logo-text">waymate</span>
        </div>

        <h2 class="auth__title">Создать аккаунт</h2>
        <p class="auth__subtitle">Регистрация займёт меньше минуты.</p>

        <form class="register__form" @submit="onSubmit">
          <div class="input-wrap">
            <span class="input-wrap__icon"><User class="icon icon--sm" /></span>
            <input v-model="form.firstName" class="input input--with-icon" placeholder="Имя" required />
          </div>
          <div class="input-wrap">
            <span class="input-wrap__icon"><User class="icon icon--sm" /></span>
            <input v-model="form.lastName" class="input input--with-icon" placeholder="Фамилия" />
          </div>
          <div class="input-wrap">
            <span class="input-wrap__icon"><Mail class="icon icon--sm" /></span>
            <input
              v-model="form.email"
              type="text"
              inputmode="email"
              autocomplete="email"
              class="input input--with-icon"
              placeholder="Email или телефон"
              required
            />
          </div>

          <div class="input-wrap">
            <span class="input-wrap__icon"><Lock class="icon icon--sm" /></span>
            <input
              v-model="form.password"
              :type="showPwd ? 'text' : 'password'"
              class="input input--with-icon"
              style="padding-right: 2.75rem"
              placeholder="Пароль (мин. 6 символов)"
              required
            />
            <button type="button" class="input-wrap__toggle" @click="showPwd = !showPwd">
              <EyeOff v-if="showPwd" class="icon icon--sm" />
              <Eye v-else class="icon icon--sm" />
            </button>
          </div>

          <div v-if="form.password.length > 0" class="register__strength">
            <div class="register__strength-bars">
              <div
                v-for="i in 4"
                :key="i"
                :class="['register__strength-bar', strengthBarClass(i - 1)]"
              />
            </div>
            <span class="register__strength-label">{{ strengthLabel }}</span>
          </div>

          <div class="input-wrap">
            <span class="input-wrap__icon"><Lock class="icon icon--sm" /></span>
            <input
              v-model="form.confirm"
              :type="showPwd ? 'text' : 'password'"
              class="input input--with-icon"
              placeholder="Повторите пароль"
              required
            />
            <p v-if="form.confirm.length > 0 && form.confirm !== form.password" class="register__mismatch">
              Пароли не совпадают
            </p>
          </div>

          <label class="register__agree">
            <input v-model="agree" type="checkbox" />
            <span>
              Я принимаю <a href="#">условия использования</a> и <a href="#">политику конфиденциальности</a>.
            </span>
          </label>

          <button
            type="submit"
            class="btn btn--hero btn--block btn--md"
            :disabled="!valid || registerMutation.isPending.value"
          >
            {{ registerMutation.isPending.value ? "Создаём..." : "Создать аккаунт" }}
          </button>
          <p v-if="registerMutation.isError.value" class="auth__error">
            {{ registerMutation.error.value?.message }}
          </p>
        </form>

        <p class="auth__footer">
          Уже есть аккаунт?
          <RouterLink to="/auth" class="auth__footer-link">Войти</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
