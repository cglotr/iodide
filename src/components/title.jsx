import React from 'react'

class Title extends React.Component {
  constructor(props) {
    super(props)
    this.state = { previousMode: props.pageMode }
    this.onBlur = this.onBlur.bind(this)
    this.onFocus = this.onFocus.bind(this)
    this.changeTitle = this.changeTitle.bind(this)
    this.enterTitleEditMode = this.enterTitleEditMode.bind(this)
  }

  onBlur() {
    if (this.props.pageMode === 'title-edit') this.props.actions.changeMode(this.state.previousMode)
  }

  onFocus() {
    if (!this.props.pageMode !== 'title-edit') {
      // this.props.actions.changeMode(this.state.previousMode)
      this.setState({ previousMode: this.props.pageMode })
      this.props.actions.changeMode('title-edit')
    }
  }

  changeTitle(evt) {
    // this.props.actions.changeMode('title-edit')
    this.props.actions.changePageTitle(evt.target.value)
  }

  enterTitleEditMode() {
    this.setState({ previousMode: this.props.pageMode })
    this.props.actions.changeMode('title-edit')
  }

  render() {
    const elem = (
      <div className={`title-field-contents ${this.props.pageMode !== 'title-edit' ? 'unselected-title-field' : ''}`}>
        <input
          ref="titleEditor" // eslint-disable-line
          onBlur={this.onBlur}
          onClick={this.onFocus}
          className={`page-title ${this.props.title === undefined ? 'unrendered-title' : ''}`}
          value={this.props.title || ''}
          placeholder="new notebook"
          onChange={this.changeTitle}
        />
      </div>
    )
    return elem
  }
}

export default Title
