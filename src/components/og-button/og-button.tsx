/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component, Prop, EventEmitter, Event, Host } from '@stencil/core';

@Component({
  tag: 'og-button',
  styleUrl: 'og-button.scss',
  shadow: true
})
export class OgButton {
  /**
   * The label of the button
   */
  @Prop()
  public label: string;

  /**
   * Determines, whether the control is disabled or not
   */
  @Prop()
  public disabled: boolean;

  /**
   * Sets the fill style for the Button to outline.
   */
  @Prop() outline: boolean;

  /**
   * Sets the shape style for the Button to round.
   */
  @Prop() round: boolean;

  /**
   * Sets the shape style for the Button to blank.
   */
  @Prop() blank: boolean;

  /**
   * Sets the shadow level of the Button.
   */
  @Prop() flat: boolean;

  /**
   * Sets the shadow level of the Button.
   */
  @Prop() raised: boolean;

  /**
   * Event is being emitted when value changes.
   */
  @Event()
  public clicked: EventEmitter;

  public handleClick(e: MouseEvent) {
    if (!this.disabled) {
      this.clicked.emit(e);
    }
    e.cancelBubble = true;
  }

  public render(): HTMLElement {
    return (
      <Host
        class={{
          'is-solid': !(this.outline || this.blank),
          'is-solid is-raised': !(this.outline || this.blank || this.flat),
          'is-outlined': !!this.outline,
          'is-round': this.round,
          'is-raised': this.raised,
          'is-blank': this.blank,
          'is-disabled': this.disabled
        }}
      >
        <button
          class="og-button"
          onClick={e => this.handleClick(e)}
          disabled={this.disabled}
        >
          <div class="og-button__text">{this.label}</div>
        </button>
      </Host>
    );
  }
}
