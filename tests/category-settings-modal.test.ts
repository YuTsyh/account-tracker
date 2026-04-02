import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import CategorySettingsModal from "../src/components/CategorySettingsModal.vue";

const store = {
  allCategories: [
    {
      id: "e1",
      name: "Food",
      type: "expense",
      icon: "restaurant",
      color: "blue",
      isDefault: true,
    },
    {
      id: "i1",
      name: "Salary",
      type: "income",
      icon: "payments",
      color: "green",
      isDefault: true,
    },
  ],
  deleteCustomCategory: vi.fn(),
  addCustomCategory: vi.fn(),
};

vi.mock("../src/stores/tracker", () => ({
  useTrackerStore: () => store,
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    locale: { value: "en" },
    t: (key: string) => key,
    te: () => false,
  }),
}));

describe("CategorySettingsModal", () => {
  it("accepts typed input when creating a custom category", async () => {
    const wrapper = mount(CategorySettingsModal, {
      global: {
        mocks: {
          $t: (key: string) => key,
          $te: () => false,
        },
        stubs: {
          BaseBottomSheet: {
            template: "<div><slot /><slot name='footer' /></div>",
          },
          BaseButton: {
            props: ["disabled"],
            template:
              "<button type='button' :disabled='disabled' @click=\"$emit('click')\"><slot /></button>",
          },
          CategoryIcon: { template: "<span />" },
        },
      },
    });

    await wrapper.get("button").trigger("click");

    const input = wrapper.get("input[type='text']");
    await input.setValue("Investments");

    expect((input.element as HTMLInputElement).value).toBe("Investments");
    expect(
      wrapper.findAll("button").at(-1)?.attributes("disabled"),
    ).toBeUndefined();
  });
});
