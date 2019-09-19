/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component, Prop, EventEmitter, Event, Host } from '@stencil/core';

@Component({
  tag: 'og-toggle-switch',
  styleUrl: 'og-toggle-switch.scss',
  shadow: true
})
export class OgToggleSwitch {

  /**
   * The value of the toggle-switch
   */
  @Prop({ mutable: true })
  public value: boolean;

  /**
   * Determines, whether the control is disabled or not
   */
  @Prop()
  public disabled: boolean;

  /**
   * Event is being emitted when value changes.
   */
  @Event()
  public changed: EventEmitter<MouseEvent>;

  private internalId = Math.random().toString(18).substring(2, 8) + Math.random().toString(18).substring(2, 8);

  public handleChange(e) {
    if (!this.disabled) {
      this.value = e.target.checked;
      this.changed.emit(e.target.checked);
    }
  }

  public render(): HTMLElement[] {
    return (
      <Host
        class={{
          'is-checked': !!this.value,
          'is-disabled': !!this.disabled,
        }}
      >
        <input
          id={this.internalId}
          class="og-toggle-switch__input"
          checked={this.value}
          disabled={this.disabled}
          onChange={event => { this.handleChange(event); }}
          tabindex="0"
          type="checkbox"
        />
        <label
          class="og-toggle-switch__toggle"
          htmlFor={this.internalId}
        >
          <div class="og-toggle-switch__toggle__knob"></div>
        </label>

      </Host>)
  }
}
