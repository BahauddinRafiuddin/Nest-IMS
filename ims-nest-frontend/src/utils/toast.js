import toast from "react-hot-toast";

export const toastSuccess = (msg) => {
  toast.success(msg);
};

export const toastError = (msg) => {
  toast.error(msg);
};

export const toastLoading = (msg) => {
  return toast.loading(msg);
};

export const toastDismiss = (id) => {
  toast.dismiss(id);
};
