// Shared interaction policy for source, moment, preview and final-video players.
export class PlaybackControls {
  private state = {
    playing: false,
    busy: false,
    locked: false,
    mouse: false,
    hovered: false,
  };
  private awake = true;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private closed = false;
  constructor(private readonly notify: (visible: boolean) => void) {}
  update(change: Partial<typeof this.state>) {
    if (this.closed) return;
    this.state = { ...this.state, ...change };
    this.refresh();
  }
  interact() {
    if (this.closed) return;
    this.awake = true;
    this.refresh();
  }
  enter(pointerType: string) {
    if (pointerType === "mouse") this.update({ mouse: true, hovered: true });
    else {
      this.update({ mouse: false });
      this.interact();
    }
  }
  leave(pointerType: string) {
    if (pointerType !== "mouse") return;
    this.awake = false;
    this.update({ mouse: true, hovered: false });
  }
  private refresh() {
    clearTimeout(this.timer);
    this.timer = undefined;
    const { playing, busy, locked, mouse, hovered } = this.state;
    this.notify(busy || locked || (mouse ? hovered : !playing || this.awake));
    if (playing && !busy && !locked && !mouse && this.awake) {
      this.timer = setTimeout(() => {
        this.timer = undefined;
        this.awake = false;
        this.refresh();
      }, 2200);
    }
  }
  dispose() {
    this.closed = true;
    clearTimeout(this.timer);
    this.timer = undefined;
  }
}
