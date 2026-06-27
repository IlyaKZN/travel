<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ArrowLeft, Camera, Eye, EyeOff, Lock } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import AppShell from "@/components/AppShell.vue";
import { api, getToken } from "@/lib/api";

const queryClient = useQueryClient();
const meQuery = useQuery({
  queryKey: ["me"],
  queryFn: api.me,
  enabled: Boolean(getToken()),
  retry: false,
});

const u = computed(() => meQuery.data.value);
const firstName = ref("");
const lastName = ref("");
const bio = ref("");
const location = ref("");
const email = ref("");
const phone = ref("");
const age = ref("");
const currentPwd = ref("");
const newPwd = ref("");
const confirmPwd = ref("");
const showPwd = ref(false);

const pwdMismatch = computed(() => confirmPwd.value.length > 0 && newPwd.value !== confirmPwd.value);

const profileMutation = useMutation({
  mutationFn: () =>
    api.updateMe({
      firstName: firstName.value,
      lastName: lastName.value,
      bio: bio.value,
      location: location.value,
      email: email.value,
      phone: phone.value,
      age: age.value,
    }),
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  },
});

const passwordMutation = useMutation({
  mutationFn: () => api.changePassword({ currentPassword: currentPwd.value, newPassword: newPwd.value }),
  onSuccess: () => {
    currentPwd.value = "";
    newPwd.value = "";
    confirmPwd.value = "";
  },
});

watch(
  u,
  (val) => {
    if (!val) return;
    firstName.value = val.firstName;
    lastName.value = val.lastName;
    bio.value = val.bio;
    location.value = val.location;
    email.value = val.email ?? "";
  },
  { immediate: true },
);
</script>

<template>
  <AppShell>
    <div v-if="!getToken()" class="container settings__gate">
      <h1 class="title title--md">Нужен вход</h1>
      <p class="text-muted">Настройки доступны после авторизации.</p>
      <RouterLink to="/auth" class="btn btn--primary btn--md" style="margin-top: 1.5rem">Войти</RouterLink>
    </div>

    <div v-else-if="!u" class="state-box">Загружаем настройки...</div>

    <template v-else>
      <section class="hero">
        <div class="hero__glow hero__glow--white" />
        <div class="hero__glow hero__glow--bottom-amber" />
        <div class="container settings__hero-inner">
          <div>
            <RouterLink to="/profile" class="settings__back">
              <ArrowLeft class="icon icon--sm" :stroke-width="2.5" /> Назад
            </RouterLink>
            <h1 class="settings__hero-title">Редактирование профиля</h1>
            <p class="settings__hero-desc">Обновите личные данные и пароль</p>
          </div>
        </div>
      </section>

      <div class="container settings__content">
        <section class="panel">
          <div class="settings__avatar-row">
            <div class="settings__avatar-wrap">
              <span class="avatar settings__avatar" :style="{ background: u.avatarColor }">
                {{ u.firstName[0] }}
              </span>
              <button type="button" class="settings__avatar-edit">
                <Camera class="icon icon--sm" />
              </button>
            </div>
            <div class="settings__avatar-hint">
              <strong>Фото профиля</strong>
              <div>PNG или JPG, до 5 МБ</div>
            </div>
          </div>

          <div class="settings__grid">
            <label class="field">
              <span class="field__label">Имя</span>
              <input v-model="firstName" class="input input--round" />
            </label>
            <label class="field">
              <span class="field__label">Фамилия</span>
              <input v-model="lastName" class="input input--round" />
            </label>
            <label class="field">
              <span class="field__label">Город</span>
              <input v-model="location" class="input input--round" />
            </label>
            <label class="field">
              <span class="field__label">Возраст</span>
              <input v-model="age" type="number" min="14" max="120" class="input input--round" />
            </label>
            <label class="field">
              <span class="field__label">Email</span>
              <input v-model="email" type="email" class="input input--round" />
            </label>
            <label class="field">
              <span class="field__label">Телефон</span>
              <input v-model="phone" type="tel" class="input input--round" />
            </label>
          </div>

          <label class="field">
            <span class="field__label">О себе</span>
            <textarea v-model="bio" rows="3" maxlength="200" class="textarea" />
            <div class="settings__counter">{{ bio.length }}/200</div>
          </label>

          <div class="settings__actions">
            <button
              type="button"
              class="btn btn--hero btn--md"
              :disabled="profileMutation.isPending.value"
              @click="profileMutation.mutate()"
            >
              {{ profileMutation.isPending.value ? "Сохраняем..." : "Сохранить" }}
            </button>
          </div>
          <p v-if="profileMutation.isError.value" class="settings__message text-error">
            {{ profileMutation.error.value?.message }}
          </p>
        </section>

        <section class="panel">
          <div class="settings__section-head">
            <span class="settings__section-icon"><Lock class="icon" /></span>
            <div>
              <h2 class="settings__section-title">Сменить пароль</h2>
              <p class="settings__section-desc">Минимум 6 символов</p>
            </div>
          </div>

          <label class="field">
            <span class="field__label">Текущий пароль</span>
            <div class="input-wrap">
              <input
                v-model="currentPwd"
                :type="showPwd ? 'text' : 'password'"
                class="input input--round"
                style="padding-right: 2.75rem"
              />
              <button type="button" class="input-wrap__toggle" @click="showPwd = !showPwd">
                <EyeOff v-if="showPwd" class="icon icon--sm" />
                <Eye v-else class="icon icon--sm" />
              </button>
            </div>
          </label>

          <div class="settings__grid">
            <label class="field">
              <span class="field__label">Новый пароль</span>
              <div class="input-wrap">
                <input
                  v-model="newPwd"
                  :type="showPwd ? 'text' : 'password'"
                  class="input input--round"
                  style="padding-right: 2.75rem"
                />
                <button type="button" class="input-wrap__toggle" @click="showPwd = !showPwd">
                  <EyeOff v-if="showPwd" class="icon icon--sm" />
                  <Eye v-else class="icon icon--sm" />
                </button>
              </div>
            </label>
            <label class="field">
              <span class="field__label">Повторите пароль</span>
              <div class="input-wrap">
                <input
                  v-model="confirmPwd"
                  :type="showPwd ? 'text' : 'password'"
                  class="input input--round"
                  style="padding-right: 2.75rem"
                />
                <button type="button" class="input-wrap__toggle" @click="showPwd = !showPwd">
                  <EyeOff v-if="showPwd" class="icon icon--sm" />
                  <Eye v-else class="icon icon--sm" />
                </button>
              </div>
              <p v-if="pwdMismatch" class="register__mismatch">Пароли не совпадают</p>
            </label>
          </div>

          <div class="settings__actions">
            <button
              type="button"
              class="btn btn--hero btn--md"
              :disabled="pwdMismatch || !newPwd || !currentPwd"
              @click="passwordMutation.mutate()"
            >
              {{ passwordMutation.isPending.value ? "Сохраняем..." : "Сохранить" }}
            </button>
          </div>
          <p v-if="passwordMutation.isError.value" class="settings__message text-error">
            {{ passwordMutation.error.value?.message }}
          </p>
          <p v-if="passwordMutation.isSuccess.value" class="settings__message text-success">
            Пароль обновлён
          </p>
        </section>
      </div>
    </template>
  </AppShell>
</template>
