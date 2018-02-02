import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import deepEqual from 'deep-equal'

import CodeMirror from '@skidding/react-codemirror'
import js from 'codemirror/mode/javascript/javascript'
import markdown from 'codemirror/mode/markdown/markdown'
import css from 'codemirror/mode/css/css'

import matchbrackets from 'codemirror/addon/edit/matchbrackets'
import closebrackets from 'codemirror/addon/edit/closebrackets'
import autorefresh from 'codemirror/addon/display/autorefresh'
import comment from 'codemirror/addon/comment/comment'
import sublime from '../codemirror-keymap-sublime'

import {getCellById} from '../notebook-utils.js'
import actions from '../actions'

class CellEditor extends React.Component {
  constructor(props) {
    super(props)
    // default editor options are for JS
    this.editorOptions = Object.assign(
      {lineNumbers: false,
        mode: this.props.cellType,
        lineWrapping: false,
        matchBrackets: true,
        autoCloseBrackets: true,
        theme: 'eclipse',
        autoRefresh: true,
        lineNumbers: true,
        readOnly: this.props.viewMode==='presentation'
      }, props.editorOptions )
    // explicitly bind "this" for all methods in constructors
    this.storeEditorElementRef = this.storeEditorElementRef.bind(this)
    this.handleFocusChange = this.handleFocusChange.bind(this)
    this.updateInputContent = this.updateInputContent.bind(this)
    this.storeEditorElementRef = this.storeEditorElementRef.bind(this)
  }

  storeEditorElementRef(editorElt){
    this.editor = editorElt
    //pass this cm instance ref up to the parent cell with this callback
    if (this.props.inputRef) { this.props.inputRef(editorElt) }
  }

  handleFocusChange(focused) {
    if (focused && this.props.viewMode === 'editor') {
      if (!this.props.cellSelected) {
        this.props.actions.selectCell(this.props.cellId)
      }
      if (!this.props.pageMode !== 'edit' && this.props.viewMode === 'editor') {
        this.props.actions.changeMode('edit')
      }
    } else if (!focused && this.props.viewMode === 'editor') {
      this.props.actions.changeMode('command')
    }
  }

  updateInputContent(content) {
    this.props.actions.updateInputContent(content)
  }

  render(){
    return (
      <div className="editor"
        onClick = {this.props.onContainerClick}
        style = {this.props.containerStyle}
      >
        <CodeMirror ref={this.storeEditorElementRef}
          value={this.props.content}
          options={this.editorOptions}
          onChange={this.updateInputContent} 
          onFocusChange={this.handleFocusChange}
        />
      </div>
    )
  }

  componentDidMount(){
    if (this.props.cellSelected
      && this.refs.hasOwnProperty('editor')
      && this.props.pageMode == 'edit') {
      this.editor.focus()
    }
  }

  componentDidUpdate(prevProps,prevState){
    if (this.props.cellSelected && this.props.pageMode == 'edit') {
      this.editor.focus()
    }
    if (!this.props.cellSelected && this.props.pageMode == 'edit') {
      this.editor.getCodeMirror().display.input.textarea.blur()
    }
    if (this.props.pageMode!='edit' || this.props.viewMode!='editor') {
      this.editor.getCodeMirror().display.input.textarea.blur()
    }

  }
}






function mapStateToProps(state,ownProps) {
  let cellId = ownProps.cellId
  let cell = getCellById(state.cells, cellId) 
  return {
    readOnly: ownProps.readOnly,
    pageMode: state.mode,
    viewMode: state.viewMode,
    cellSelected: cell.selected,
    cellType: cell.cellType,
    content: cell.content,
    cellId: cellId
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CellEditor)