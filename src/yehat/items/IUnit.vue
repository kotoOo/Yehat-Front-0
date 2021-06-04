<template>
  <div class="unit-scene">Unit</div>
</template>

<style lang="scss" scoped>
.unit-scene {
  background-color: #13062380;
  border: 1px solid rgba(255,255,255,0.5);
  color: white;

  transition: border 0.3s, background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #130623;
    border: 1px solid #ffc700;
    color: #ffc700;
  }
}
</style>