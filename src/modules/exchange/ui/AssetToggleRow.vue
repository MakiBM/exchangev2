<template>
  <div class="c-asset-toggle-row">
    <ItemFocusArrow v-if="!isUnlocked" />
    <Toggle
      leftLabel="OFF"
      rightLabel="ON"
      :checked="isUnlocked"
      :isLoading="isSigning || isPending"
      :isAllowances="true"
      @click.native="$emit('toggle')" />
    <ProcessingBar
      v-if="isPending"
      class="c-asset-toggle-row__processing-bar"
      :length="6" />
    <span class="c-asset-toggle-row__symbol">
      {{ symbol }}
    </span>
  </div>
</template>

<script>
import Toggle from '@/ui/Toggle'
import ItemFocusArrow from '@/modules/exchange/ui/ItemFocusArrow'
import ProcessingBar from '@/modules/exchange/ui/ProcessingBar'

export default {
  name: 'AssetToggleRow',
  components: {
    Toggle,
    ItemFocusArrow,
    ProcessingBar,
  },
  props: {
    symbol: String,
    isUnlocked: Boolean,
    isPending: Boolean,
    isSigning: Boolean,
  },
}
</script>

<style lang="scss">
.c-asset-toggle-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 35px;
  padding: 6px 13px;
  background: rgba($grey-2, 0.5);
}

.c-asset-toggle-row__processing-bar {
  width: 90px;
}

.c-asset-toggle-row__symbol {
  opacity: 0.5;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}
</style>
