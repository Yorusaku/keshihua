import type { Directive } from 'vue';
import { useAuthStore } from './store';
import type { PermissionAction } from './types';

export const vPermission: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    const authStore = useAuthStore();
    const [resource, action] = binding.value.split(':');

    if (!authStore.hasPermission(resource, action as PermissionAction)) {
      el.style.display = 'none';
    }
  },
  updated(el, binding) {
    const authStore = useAuthStore();
    const [resource, action] = binding.value.split(':');

    if (!authStore.hasPermission(resource, action as PermissionAction)) {
      el.style.display = 'none';
    } else {
      el.style.display = '';
    }
  },
};
