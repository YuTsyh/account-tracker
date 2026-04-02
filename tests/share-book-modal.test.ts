import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import ShareBookModal from "../src/components/books/ShareBookModal.vue";

vi.mock("../src/stores/tracker", () => ({
  useTrackerStore: () => ({
    userProfile: {
      animations: true,
    },
  }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    locale: { value: "en" },
    t: (key: string) => key,
  }),
}));

describe("ShareBookModal", () => {
  it("closes when the close button is clicked", async () => {
    const wrapper = mount(ShareBookModal, {
      props: {
        modelValue: true,
        shareCode: "ABC123",
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          teleport: true,
        },
      },
    });

    await wrapper.findAll("button").at(1)?.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
  });
});
