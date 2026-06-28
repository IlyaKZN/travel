<script setup lang="ts">
import { Compass, Users, MessageCircle, ArrowRight } from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const slides = [
  {
    icon: Compass,
    title: "Совместные приключения",
    text: "Собирай компанию для уикенда в горах, поездки на фестиваль или большого путешествия.",
  },
  {
    icon: Users,
    title: "Новые знакомства",
    text: "Знакомься с людьми, которым по душе твой стиль отдыха, ещё до старта поездки.",
  },
  {
    icon: MessageCircle,
    title: "Эмоции, которые остаются",
    text: "Делитесь планами и впечатлениями в общем чате — а после поездки оставайтесь на связи.",
  },
];

const step = ref(0);
const router = useRouter();

onMounted(() => {
  if (localStorage.getItem("waymate.onboarded")) {
    router.push("/");
  }
});

function done() {
  localStorage.setItem("waymate.onboarded", "1");
  router.push("/");
}

function next() {
  if (step.value < slides.length - 1) step.value++;
  else done();
}
</script>

<template>
  <div class="onboarding">
    <div class="onboarding__top">
      <div class="auth__visual-logo">
        <span class="auth__logo-icon"><img src="/favicon.png" alt="" class="auth__logo-image" /></span>
        <span class="auth__logo-text">ЕдемВместе</span>
      </div>
      <button type="button" class="onboarding__skip" @click="done">Пропустить</button>
    </div>

    <div class="onboarding__content">
      <div class="onboarding__icon-wrap">
        <component :is="slides[step].icon" class="onboarding__icon" />
      </div>
      <h1 class="onboarding__title">{{ slides[step].title }}</h1>
      <p class="onboarding__text">{{ slides[step].text }}</p>

      <div class="onboarding__dots">
        <span
          v-for="(_, i) in slides"
          :key="i"
          :class="['onboarding__dot', { 'onboarding__dot--active': i === step }]"
        />
      </div>
    </div>

    <div class="onboarding__actions">
      <button type="button" class="btn btn--white btn--block btn--lg" @click="next">
        {{ step < slides.length - 1 ? "Дальше" : "Начать" }}
        <ArrowRight class="icon icon--sm" />
      </button>
      <RouterLink to="/auth" class="onboarding__login-link">У меня уже есть аккаунт</RouterLink>
    </div>
  </div>
</template>
