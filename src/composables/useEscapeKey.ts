import { onMounted, onUnmounted, Ref } from "vue";

/**
 * Composable to handle Escape key press for closing dialogs/modals.
 * @param isActive - Reactive reference to the dialog's visibility state.
 * @param onEscape - Callback function to execute when Escape is pressed while isActive is true.
 */
export function useEscapeKey(isActive: Ref<boolean>, onEscape: () => void) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isActive.value) {
      onEscape();
    }
  };

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  // Optional: Ensure listener is removed if component is unmounted while active
  // though onUnmounted handles this.
}
