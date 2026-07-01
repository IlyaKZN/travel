<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ArrowLeft, Bell, BellOff, Camera, Eye, EyeOff, Lock } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import AppShell from "@/components/AppShell.vue";
import { api, getToken } from "@/lib/api";
import { avatarClass, avatarStyle } from "@/lib/avatar";
import { isEmailContact, validateAuthContact } from "@/lib/contactPolicy";
import {
  disablePushNotifications,
  enablePushNotifications,
  isPushSupported,
  pushPermission,
} from "@/lib/push-notifications";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];

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
const avatar = ref("");
const avatarError = ref("");
const emailError = ref("");
const avatarInput = ref<HTMLInputElement | null>(null);
const currentPwd = ref("");
const newPwd = ref("");
const confirmPwd = ref("");
const showPwd = ref(false);
const pushStatus = ref<ReturnType<typeof pushPermission>>(pushPermission());
const pushBusy = ref(false);
const pushMessage = ref("");
const pushMessageIsError = ref(false);

const pwdMismatch = computed(() => confirmPwd.value.length > 0 && newPwd.value !== confirmPwd.value);
const avatarPreviewUser = computed(() => (u.value ? { ...u.value, avatar: avatar.value } : u.value));

const profileMutation = useMutation({
  mutationFn: () =>
    api.updateMe({
      firstName: firstName.value,
      lastName: lastName.value,
      avatar: avatar.value,
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
    avatar.value = val.avatar ?? "";
  },
  { immediate: true },
);

function openAvatarPicker() {
  avatarInput.value?.click();
}

function resetAvatar() {
  avatar.value = "";
  avatarError.value = "";
  if (avatarInput.value) {
    avatarInput.value.value = "";
  }
}

function saveProfile() {
  emailError.value = "";
  if (isEmailContact(email.value)) {
    const check = validateAuthContact(email.value);
    if (!check.ok) {
      emailError.value = check.error;
      return;
    }
  }
  profileMutation.mutate();
}

function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  avatarError.value = "";
  if (!AVATAR_TYPES.includes(file.type)) {
    avatarError.value = "Выберите PNG, JPG или WebP.";
    input.value = "";
    return;
  }
  if (file.size > MAX_AVATAR_SIZE) {
    avatarError.value = "Файл должен быть до 5 МБ.";
    input.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    avatar.value = typeof reader.result === "string" ? reader.result : "";
    input.value = "";
  };
  reader.onerror = () => {
    avatarError.value = "Не удалось прочитать файл.";
    input.value = "";
  };
  reader.readAsDataURL(file);
}

async function togglePushNotifications() {
  pushMessage.value = "";
  pushMessageIsError.value = false;
  if (!isPushSupported()) {
    pushMessage.value = "Браузер не поддерживает push-уведомления.";
    pushMessageIsError.value = true;
    return;
  }

  pushBusy.value = true;
  try {
    if (pushStatus.value === "granted") {
      await disablePushNotifications();
      pushStatus.value = pushPermission();
      pushMessage.value = "Push-уведомления отключены.";
      return;
    }

    const result = await enablePushNotifications();
    pushStatus.value = pushPermission();
    if (result === "granted") {
      pushMessage.value = "Push-уведомления включены.";
    } else if (result === "denied") {
      pushMessage.value = "Разрешите уведомления в настройках браузера.";
      pushMessageIsError.value = true;
    } else if (result === "unconfigured") {
      pushMessage.value = "Push не настроен на сервере (VAPID-ключи). Перезапустите сервер после добавления ключей в server/.env.";
      pushMessageIsError.value = true;
    }
  } catch (error) {
    pushMessage.value = error instanceof Error ? error.message : "Не удалось изменить настройки уведомлений.";
    pushMessageIsError.value = true;
  } finally {
    pushBusy.value = false;
  }
}
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
              <span
                :class="['avatar settings__avatar', avatarClass(avatarPreviewUser)]"
                :style="avatarStyle(avatarPreviewUser)"
              >
                {{ u.firstName[0] }}
              </span>
              <button
                type="button"
                class="settings__avatar-edit"
                aria-label="Загрузить фото профиля"
                @click="openAvatarPicker"
              >
                <Camera class="icon icon--sm" />
              </button>
              <input
                ref="avatarInput"
                class="settings__avatar-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                @change="handleAvatarChange"
              />
            </div>
            <div class="settings__avatar-hint">
              <strong>Фото профиля</strong>
              <div>PNG, JPG или WebP, до 5 МБ</div>
              <button v-if="avatar" type="button" class="settings__avatar-remove" @click="resetAvatar">
                Удалить фото
              </button>
              <p v-if="avatarError" class="settings__avatar-error">{{ avatarError }}</p>
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
              <p v-if="emailError" class="register__mismatch">{{ emailError }}</p>
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
              :disabled="profileMutation.isPending.value || Boolean(avatarError) || Boolean(emailError)"
              @click="saveProfile"
            >
              {{ profileMutation.isPending.value ? "Сохраняем..." : "Сохранить" }}
            </button>
          </div>
          <p v-if="profileMutation.isError.value" class="settings__message text-error">
            {{ profileMutation.error.value?.message }}
          </p>
        </section>

        <section v-if="isPushSupported()" class="panel">
          <div class="settings__section-head">
            <span class="settings__section-icon"><Bell class="icon" /></span>
            <div>
              <h2 class="settings__section-title">Push-уведомления</h2>
              <p class="settings__section-desc">
                Заявки на поездки и ответы организатора, даже когда вкладка закрыта
              </p>
            </div>
          </div>

          <div class="settings__actions">
            <button
              type="button"
              class="btn btn--hero btn--md"
              :disabled="pushBusy"
              @click="togglePushNotifications"
            >
              <BellOff v-if="pushStatus === 'granted'" class="icon icon--sm" />
              <Bell v-else class="icon icon--sm" />
              {{
                pushBusy
                  ? "Сохраняем..."
                  : pushStatus === "granted"
                    ? "Отключить уведомления"
                    : "Включить уведомления"
              }}
            </button>
          </div>
          <p
            v-if="pushMessage"
            class="settings__message"
            :class="pushMessageIsError ? 'text-error' : 'text-success'"
          >
            {{ pushMessage }}
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
