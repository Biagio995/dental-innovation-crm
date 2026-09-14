import { useState, useEffect } from 'react'
import { Eye, Info } from 'lucide-react'
import type { MessageTemplate, MessageTemplateCreate, TemplateChannel } from '@/types/template'
import {
  TEMPLATE_CHANNEL_LABELS,
  AVAILABLE_VARIABLES,
  TEMPLATE_EXAMPLES,
} from '@/types/template'
import * as templatesApi from '@/api/templates'

interface TemplateFormProps {
  template: MessageTemplate | null
  onSubmit: (data: MessageTemplateCreate) => Promise<void>
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
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [showVariables, setShowVariables] = useState(false)
  const [previewResult, setPreviewResult] = useState<{ subject: string | null; body: string } | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  useEffect(() => {
    if (template) {
      setName(template.name)
      setChannel(template.channel)
      setSubject(template.subject || '')
      setBody(template.body)
      setIsActive(template.is_active)
    } else {
      setName('')
      setChannel('sms')
      setSubject('')
      setBody('')
      setIsActive(true)
    }
    setPreviewResult(null)
  }, [template])

  function handleChannelChange(newChannel: TemplateChannel) {
    setChannel(newChannel)
    if (newChannel === 'sms') {
      setSubject('')
    }
    setPreviewResult(null)
  }

  function loadExample(exampleKey: string) {
    const example = TEMPLATE_EXAMPLES[exampleKey]
    if (example) {
      setBody(example.body)
      if (example.subject && channel === 'email') {
        setSubject(example.subject)
      }
    }
    setPreviewResult(null)
  }

  function insertVariable(variable: string) {
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newBody = body.slice(0, start) + variable + body.slice(end)
      setBody(newBody)
      setPreviewResult(null)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length
        textarea.focus()
      }, 0)
    } else {
      setBody(body + variable)
      setPreviewResult(null)
    }
  }

  async function handlePreview() {
    if (!template) return
    
    setIsPreviewLoading(true)
    try {
      const result = await templatesApi.previewTemplate(template.id, {
        data: {
          nome: 'Mario',
          cognome: 'Rossi',
          data: '15/01/2024',
          ora: '10:30',
          telefono: '+39 02 1234567',
          data_richiamo: '15/07/2024',
          tipo_visita: 'Controllo',
        },
      })
      setPreviewResult(result)
    } catch (err) {
      console.error('Failed to preview template:', err)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      name,
      channel,
      subject: channel === 'email' ? subject || null : null,
      body,
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

        <div className="form-group" style={{ alignSelf: 'flex-end' }}>
          <div className="btn-group">
            <select
              className="filter-select"
              onChange={(e) => {
                if (e.target.value) {
                  loadExample(e.target.value)
                  e.target.value = ''
                }
              }}
              disabled={isLoading}
            >
              <option value="">Carica esempio...</option>
              {channel === 'sms' && (
                <>
                  <option value="sms_reminder_48h">Promemoria 48h</option>
                  <option value="sms_reminder_24h">Promemoria 24h</option>
                  <option value="sms_post_visit">Post visita</option>
                  <option value="sms_recall">Richiamo</option>
                </>
              )}
              {channel === 'email' && (
                <option value="email_reminder">Promemoria email</option>
              )}
            </select>
          </div>
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
            onChange={(e) => {
              setSubject(e.target.value)
              setPreviewResult(null)
            }}
            className="form-input"
            required={channel === 'email'}
            disabled={isLoading}
            placeholder="es. Promemoria appuntamento — {data}"
          />
        </div>
      )}

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="template-body" className="form-label">
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
          id="template-body"
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            setPreviewResult(null)
          }}
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
            Caratteri: {body.length}/160 {body.length > 160 && `(${Math.ceil(body.length / 153)} SMS)`}
          </p>
        )}
      </div>

      {template && (
        <div className="form-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePreview}
            disabled={isLoading || isPreviewLoading}
          >
            <Eye size={16} />
            {isPreviewLoading ? 'Caricamento...' : 'Anteprima'}
          </button>
          
          {previewResult && (
            <div className="preview-panel">
              <p className="preview-title">Anteprima con dati di esempio:</p>
              {previewResult.subject && (
                <div className="preview-field">
                  <strong>Oggetto:</strong> {previewResult.subject}
                </div>
              )}
              <div className="preview-field">
                <strong>Messaggio:</strong>
                <pre className="preview-content">{previewResult.body}</pre>
              </div>
            </div>
          )}
        </div>
      )}

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
