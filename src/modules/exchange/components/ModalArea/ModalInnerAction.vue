<template>
  <div class="c-modal-inner-action">
    <div class="c-modal-inner-action__slot">
      <slot />
    </div>
    <strong class="c-modal-inner-action__title">
      <a
        v-if="titleUrl"
        :href="titleUrl"
        class="__link"
        target="_blank"
        rel="nofollow noopener">
        {{ title }}
      </a>
      <template v-else>
        {{ title }}
      </template>
    </strong>
    <p
      :class="{'-success': isSuccess}"
      class="c-modal-inner-action__desc">
      <img
        v-if="isSuccess"
        src="@/assets/icons/checkmark-circle.svg"
        svg-inline
        svg-sprite>
      {{ desc }}
    </p>
    <Button
      v-if="buttonText"
      :class="{'-disabled': isDisabled}"
      class="-blue -medium -full-width"
      @click.native="$emit('buttonClick')">
      <ItemFocusArrow v-if="isFocused" />
      {{ buttonText }}
    </Button>
  </div>
</template>

<script>
import Button from '@/ui/Button'
import ItemFocusArrow from '@/modules/exchange/ui/ItemFocusArrow'

export default {
  name: 'ModalInnerAction',
  components: {
    Button,
    ItemFocusArrow
  },
  props: {
    title: String,
    titleUrl: String,
    desc: String,
    isSuccess: Boolean,
    isFocused: Boolean,
    isDisabled: Boolean,
    buttonText: String,
  },
}
</script>

<style lang="scss">
.c-modal-inner-action {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  max-width: 250px;
  width: 100%;
  margin: 0 auto;
  padding-bottom: 15px;
  text-align: center;
}

.c-modal-inner-action__slot {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-grow: 1;
}

.c-modal-inner-action__title {
  display: flex;
  justify-content: center;
  margin-bottom: 9px;
  font-size: 17px;
}

.c-modal-inner-action__desc {
  display: flex;
  justify-content: center;
  margin-bottom: 21px;
  min-height: 38px;
  font-size: 13px;
  line-height: 1.2;
  color: rgba($white, 0.5);
  white-space: pre;

  .-tight & {
    font-size: 12px;
    line-height: 1.2;
  }

  &.-success,
  &.-success .-tight & {
    color: $green;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
}
</style>
