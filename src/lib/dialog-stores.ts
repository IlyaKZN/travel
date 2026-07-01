import { reactive, readonly } from "vue";

type CreateDialogState = { open: boolean; tripId?: string };

const createState = reactive<CreateDialogState>({ open: false });
const notificationsState = reactive({ open: false });

export const createDialogStore = {
  state: readonly(createState),
  open(tripId?: string) {
    createState.open = true;
    createState.tripId = tripId;
  },
  close() {
    createState.open = false;
    createState.tripId = undefined;
  },
};

export const notificationsDialogStore = {
  state: readonly(notificationsState),
  open() {
    notificationsState.open = true;
  },
  close() {
    notificationsState.open = false;
  },
};
