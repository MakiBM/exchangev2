<template>
  <table class="c-table">
    <thead class="c-table__head">
      <tr class="c-table__head-row">
        <TableCell
          v-for="(col, index) in cols"
          :key="`c-table__head-cell-${index}`"
          :data-sort="col.label"
          :style="col.width && `width: ${col.width};`"
          :class="[
            {'sort': col.sortable},
            sort && sort.col === col.label && sort.type // insert asc/desc class name
          ]"
          class="c-table__head-cell"
          @click.native="col.sortable && $emit('sort', col.label)">
          <strong>{{ col.label }}</strong>
          <img
            v-if="sort && sort.col === col.label"
            class="c-table__head-icon"
            src="@/assets/icons/arrow.svg"
            svg-inline
            svg-sprite>
          <div
            v-if="col.sortable"
            class="c-table__head-cell-line">
          </div>
        </TableCell>
      </tr>
    </thead>
    <tbody class="c-table__body">
      <tr>
        <!--
        This is a hack for scrollable table body
        https://stackoverflow.com/questions/14834198/table-scroll-with-html-and-css
        -->
        <td :colspan="cols.length">
          <div class="c-table__scrollable">
            <div
              :style="maxHeight"
              class="c-table__scrollable-inner">
              <table>
                <tr>
                  <!-- Redistribute widths again to match thead -->
                  <td
                    v-for="(col, index) in cols"
                    :key="`c-table__body-cell-${index}`"
                    :style="`width: ${col.width};`"/>
                </tr>

                <!-- Render table body -->
                <slot />

                <!-- Table Footer Variants -->
                <TableFooter v-if="isLoading" :colspan="cols.length">
                  <div class="c-loading">
                    <img
                      src="@/assets/icons/spinner.svg"
                      svg-inline
                      svg-sprite>
                    <strong class="c-loading__text">
                      Loading
                    </strong>
                  </div>
                </TableFooter>

                <TableFooter v-else-if="nextPage" :colspan="cols.length">
                  <a
                    class="__link"
                    @click="$emit('loadMore')">
                    Load More
                  </a>
                </TableFooter>

                <TableFooter v-else-if="errorText" :colspan="cols.length">
                  <div class="c-table__error">
                    {{ errorText }}
                  </div>
                </TableFooter>

                <TableFooter v-else-if="emptyText && !$slots.default" :colspan="cols.length">
                  <div class="c-table__empty">
                    {{ emptyText }}
                  </div>
                </TableFooter>

              </table>
            </div>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import TableCell from '@/ui/TableCell'
import TableFooter from '@/ui/TableFooter'

export default {
  name: 'Table',
  components: {
    TableCell,
    TableFooter,
  },
  props: {
    cols: { type: Array, required: true },
    sort: { type: Object },
    visibleRows: { type: Number },
    isLoading: { type: Boolean },
    nextPage: { type: String },
    errorText: { type: String },
    emptyText: { type: String },
  },
  computed: {
    maxHeight () {
      const rowHeight = 50
      return this.visibleRows
        ? `max-height:${this.visibleRows * rowHeight}px;`
        : false
    },
  },
}
</script>

<style lang="scss">
.c-table {
  table-layout: fixed;
  position: relative;
  min-width: 900px;
  width: 100%;
  font-size: 12px;
  line-height: 15px;
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.3);
  border-collapse: collapse;
  border-spacing: 0;
}

.c-table__head-row {
  background-color: $grey-1;
}

.c-table__head-cell {
  &.sort {
    position: relative;
    cursor: pointer;
  }

  &.asc,
  &.desc {
    background: $blue-dark;
  }
}

.c-table__head-cell-line {
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: $blue;
  transform: scaleX(0);
  opacity: 0;
  transition: all 0.1s $ease;

  .asc &,
  .desc & {
    opacity: 1;
    transform: scaleX(1);
  }
}

.c-table__head-icon {
  position: absolute;
  top: 18px;
  right: 10px;
  transform-origin: center;
  transition: transform $quick-ease;

  .asc & { transform: rotate(90deg); }
  .desc & { transform: rotate(-90deg); }
}

.c-table__scrollable {
  overflow: hidden;
}

.c-table__scrollable-inner {
  overflow-y: auto;
  width: calc(100% + 20px);
  padding-right: 20px;

  table { width: 100%; }
}

.c-loading {
  display: flex;
  align-items: center;
}

.c-loading__text {
  opacity: 0.5;
  margin-left: 5px;
}

/* Crosshairs */
.c-table {
  &::before {
    @include crosshair-left-top($black);
    top: -0.5px;
    left: 0;
    height: 7px;
    width: 7px;
  }

  &::after {
    @include crosshair-right-top($black);
    top: -0.5px;
    right: 0;
    height: 7px;
    width: 7px;
  }
}

.c-table__scrollable {
  position: relative;

  &::before {
    @include crosshair-left-bottom($black);
    bottom: 0;
    left: 0;
    height: 7px;
    width: 7px;
  }

  &::after {
    @include crosshair-right-bottom($black);
    bottom: 0;
    right: 0;
    height: 7px;
    width: 7px;
  }
}

.c-table__head-cell,
.c-table__scrollable tr:not(:last-of-type) td {
  position: relative;

  &:first-of-type::before {
    @include crosshair-left-center($black);
    bottom: -4px;
    left: 0;
    height: 9px;
    width: 5px;
  }

  &:last-of-type::after {
    @include crosshair-right-center($black);
    bottom: -4px;
    right: 0;
    height: 9px;
    width: 5px;
  }
}

.c-table__head-cell {
  &:not(:first-of-type)::before {
    @include crosshair-full($black);
    bottom: -4px;
    left: -4px;
    height: 9px;
    width: 9px;
  }

  &:not(:last-of-type)::after {
    @include crosshair-top-center($black);
    top: -0.5px;
    right: -5px;
    height: 5px;
    width: 9px;
  }
}

.c-table__empty {
  text-align: center;
  opacity: 0.3;
}

.c-table__error {
  text-align: center;
  color: $red;
}
</style>
