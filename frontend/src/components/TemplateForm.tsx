import { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import type { Template, TemplateFormData, TemplateChannel, TemplateType } from '@/types/template'
import {
  TEMPLATE_CHANNEL_LABELS,
  TEMPLATE_TYPE_LABELS,
  AVAILABLE_VARIABLES,
  TEMPLATE_EXAMPLES,
} from '@/types/template'

interface TemplateFormProps {
  template: Template | null
  onSubmit: (data: TemplateFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function TemplateForm({
  template,
  onSubmit,
  onCancel,
  isLoading = false,
}: TemplateFormProps) {
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<TemplateChannel>('sms')
  const [type, setType] = useState<TemplateType>('reminder_48h')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [showVariables, setShowVariables] = useState(false)

  useEffect(() => {
    if (template) {
      setName(template.name)
      setChannel(template.channel)
      setType(template.type)
      setSubject(template.subject || '')
      setContent(template.content)
      setIsActive(template.is_active)
    } else {
      setName('')
      setChannel('sms')
      setType('reminder_48h')
      setSubject('')
      setContent('')
      setIsActive(true)
    }
  }, [template])

  function handleChannelChange(newChannel: TemplateChannel) {
    setChannel(newChannel)
    if (newChannel === 'sms') {
      setSubject('')
    }
  }

  function loadExample() {
    const key = `${channel}_${type}`
    const example = TEMPLATE_EXAMPLES[key]
    if (example) {
      setContent(example.content)
      if (example.subject && channel === 'email') {
        setSubject(example.subject)
      }
    }
  }

  function insertVariable(variable: string) {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.slice(0, start) + variable + content.slice(end)
      setContent(newContent)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length
        textarea.focus()
      }, 0)
    } else {
      setContent(content + variable)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      name,
      channel,
      type,
      subject: channel === 'email' ? subject || null : null,
      content,
      is_active: isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-row">
        <div className="form-group flex-1">
          <label htmlFor="template-name" className="form-label">
            Nome template <span className="required">*</span>
          </label>
          <input
            type="text"
            id="template-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            required
            disabled={isLoading}
            placeholder="es. Promemoria appuntamento 48h"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="template-channel" className="form-label">
            Canale <span className="required">*</span>
          </label>
          <select
            id="template-channel"
            value={channel}
            onChange={(e) => handleChannelChange(e.target.value as TemplateChannel)}
            className="form-select"
            required
            disabled={isLoading}
          >
            {Object.entries(TEMPLATE_CHANNEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="template-type" className="form-label">
            Tipo <span className="required">*</span>
          </label>
          <select
            id="template-type"
            value={type}
            onChange={(e) => setType(e.target.value as TemplateType)}
            className="form-select"
            required
            disabled={isLoading}
          >
            {Object.entries(TEMPLATE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ alignSelf: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={loadExample}
            disabled={isLoading}
          >
            Carica esempio
          </button>
        </div>
      </div>

      {channel === 'email' && (
        <div className="form-group">
          <label htmlFor="template-subject" className="form-label">
            Oggetto <span className="required">*</span>
          </label>
          <input
            type="text"
            id="template-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-input"
            required={channel === 'email'}
            disabled={isLoading}
            placeholder="es. Promemoria appuntamento — {data}"
          />
        </div>
      )}

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="template-content" className="form-label">
            Contenuto <span className="required">*</span>
          </label>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setShowVariables(!showVariables)}
          >
            <Info size={14} />
            {showVariables ? 'Nascondi variabili' : 'Mostra variabili'}
          </button>
        </div>
        
        {showVariables && (
          <div className="variables-panel">
            <p className="variables-title">Variabili disponibili (clicca per inserire):</p>
            <div className="variables-grid">
              {AVAILABLE_VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  className="variable-chip"
                  onClick={() => insertVariable(v.key)}
                  title={`${v.description} (es. ${v.example})`}
                >
                  {v.key}
                </button>
              ))}
            </div>
          </div>
        )}

        <textarea
          id="template-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="form-textarea"
          rows={channel === 'email' ? 8 : 4}
          required
          disabled={isLoading}
          placeholder={
            channel === 'sms'
              ? 'Ciao {nome}, ti ricordiamo l\'appuntamento...'
              : 'Gentile {nome},\n\nLe ricordiamo il suo appuntamento...'
          }
        />
        {channel === 'sms' && (
          <p className="form-hint">
            Caratteri: {content.length}/160 {content.length > 160 && `(${Math.ceil(content.length / 153)} SMS)`}
          </p>
        )}
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isLoading}
          />
          <span>Template attivo</span>
        </label>
        <p className="form-hint">
          Solo i template attivi possono essere usati per l'invio automatico
        </p>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annulla
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Salvataggio...' : template ? 'Salva modifiche' : 'Crea template'}
        </button>
      </div>
    </form>
  )
}
