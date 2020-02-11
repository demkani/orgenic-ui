/**
 * ORGENIC-UI
 * @license MIT
 * See LICENSE file at https://github.com/orgenic/orgenic-ui/blob/master/LICENSE
 **/

import { h, Component, Prop, Event, EventEmitter, Host, State } from '@stencil/core';

@Component({
  tag: 'og-textarea',
  styleUrl: 'og-textarea.scss',
  shadow: true
})
export class OgTextarea {

  /** Controls the 'is-focused' style of the control */
  @State()
  private isFocused: boolean;

  /**
   * Id of the control. If none is privide a unique hash will be generated.
   */
  @Prop() id: string = this.generateUid();

  /**
   * Determines, whether the control is disabled or not.
   */
  @Prop()
  public disabled: boolean;

  /**
   * The initial value. Can be updated at runtime.
   */
  @Prop({ mutable: true, reflectToAttr: true })
  public value: string;

  /**
   * Optional label text
   */
  @Prop() label?: string;

  /**
   * Optional placeholder text if control is empty.
   */
  @Prop()
  public placeholder?: string;

  /**
   * Event is being emitted when value changes.
   */
  @Event()
  public valueChanged: EventEmitter<string>;

  public handleChange(e) {
    this.value = e.target.value;
    this.valueChanged.emit(this.value);
  }

  private handleFocus(focus: boolean) {
    this.isFocused = focus;
  }

  private generateUid() {
    return (
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15)
    );
  }

  public render(): HTMLElement {
    return (
      <Host
        class={{
          "is-focused": this.isFocused,
          "is-disabled": this.disabled,
          "has-content": (this.value && this.value.length > 0)
            || (this.placeholder && this.placeholder.length > 0),
        }}
      >
        <div class="og-textarea">
          <label htmlFor={this.id} class="og-textarea__box">
            {
              this.label &&
              <span class="og-textarea__label">{this.label}</span>
            }
            <textarea
              // Default attributes
              class="og-textarea__input"
              disabled={this.disabled}
              id={this.id}
              onBlur={() => this.handleFocus(false)}
              onFocus={() => this.handleFocus(true)}
              onInput={event => this.handleChange(event)}
              placeholder={this.placeholder}
              value={this.value}
            ></textarea>
            <div class="og-textarea__indicator" />
          </label>
        </div>
      </Host>
      // <Host class={{ 'og-form-item__editor': true }}>
      //   <textarea
      //     class="og-textarea__textarea"
      //     value={ this.value }
      //     disabled={ this.disabled }
      //     onInput={ (event) => this.handleChange(event) }
      //     onFocus={ (event) => this.focusGained.emit(event) }
      //     onBlur={ (event) => this.focusLost.emit(event) }
      //   ></textarea>
      //   <div class="og-textarea__indicator"></div>
      // </Host>
    );
  }
}
