import type { CSSProperties } from 'react';
import { tokens, type SlideInResult } from 'remotion-scene-kit';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  doneProgress?: number;
}

export interface TodosAppProps {
  todos: Todo[];
  inputValue: string;
  rowAnimations?: SlideInResult[];
  caretVisible?: boolean;
  footerNote?: string;
  footerNoteOpacity?: number;
}

const cardStyle: CSSProperties = {
  margin: '64px auto 0',
  maxWidth: 520,
  backgroundColor: '#FFFFFF',
  borderRadius: 18,
  padding: '32px 36px 36px',
  boxShadow:
    '0 1px 2px rgba(10,10,12,0.04), 0 8px 30px rgba(10,10,12,0.08)',
  border: '1px solid #EEF0F3',
  fontFamily: tokens.fonts.sans,
  color: '#0A0A0C',
};

const pageStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  backgroundColor: '#F6F7F9',
  padding: 40,
  boxSizing: 'border-box',
};

const headingRow: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  marginBottom: 22,
};

const inputShell: CSSProperties = {
  display: 'flex',
  gap: 10,
  marginBottom: 20,
};

const inputBox: CSSProperties = {
  flex: 1,
  padding: '12px 14px',
  border: '1px solid #D4D4D8',
  borderRadius: 10,
  fontSize: 16,
  color: '#0A0A0C',
  backgroundColor: '#FAFAFA',
  fontFamily: tokens.fonts.sans,
  display: 'flex',
  alignItems: 'center',
  minHeight: 22,
};

const inputPlaceholder: CSSProperties = {
  color: '#9CA3AF',
};

const addButton: CSSProperties = {
  padding: '12px 20px',
  backgroundColor: '#0A0A0C',
  color: 'white',
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 15,
  display: 'inline-flex',
  alignItems: 'center',
};

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  minHeight: 120,
};

const emptyStateStyle: CSSProperties = {
  padding: '28px 12px',
  color: '#9CA3AF',
  fontSize: 14,
  textAlign: 'center',
};

const rowStyleBase: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 4px',
  borderBottom: '1px solid #F1F2F4',
};

const checkboxBase: CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 6,
  border: '1.5px solid #C3C6CC',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background-color 100ms',
};

const deleteButton: CSSProperties = {
  color: '#9CA3AF',
  fontSize: 20,
  lineHeight: 1,
  paddingLeft: 8,
};

export function TodosApp({
  todos,
  inputValue,
  rowAnimations,
  caretVisible = true,
  footerNote,
  footerNoteOpacity = 0,
}: TodosAppProps) {
  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={headingRow}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              letterSpacing: -0.5,
            }}
          >
            Todos
          </h1>
          <span style={{ fontSize: 13, color: '#9CA3AF' }}>
            {todos.length === 0
              ? 'nothing yet'
              : `${remaining} of ${todos.length} left`}
          </span>
        </div>

        <div style={inputShell}>
          <div style={inputBox}>
            {inputValue.length === 0 ? (
              <span style={inputPlaceholder}>What needs doing?</span>
            ) : (
              <span>{inputValue}</span>
            )}
            {caretVisible ? (
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: 18,
                  backgroundColor: '#0A0A0C',
                  marginLeft: 2,
                }}
              />
            ) : null}
          </div>
          <span style={addButton}>Add</span>
        </div>

        <div style={listStyle}>
          {todos.length === 0 ? (
            <div style={emptyStateStyle}>No todos yet — add one above.</div>
          ) : (
            todos.map((todo, i) => {
              const anim = rowAnimations?.[i];
              const opacity = anim?.opacity ?? 1;
              const tx = anim?.translateX ?? 0;
              const ty = anim?.translateY ?? 0;
              const p = todo.doneProgress ?? (todo.done ? 1 : 0);

              return (
                <div
                  key={todo.id}
                  style={{
                    ...rowStyleBase,
                    opacity,
                    transform: `translate(${tx}px, ${ty}px)`,
                  }}
                >
                  <span
                    style={{
                      ...checkboxBase,
                      backgroundColor:
                        p > 0 ? `rgba(10,10,12,${p})` : 'transparent',
                      borderColor: p > 0.5 ? '#0A0A0C' : '#C3C6CC',
                    }}
                  >
                    {p > 0.2 ? (
                      <span
                        style={{
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 700,
                          opacity: p,
                        }}
                      >
                        ✓
                      </span>
                    ) : null}
                  </span>

                  <span
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: p > 0.5 ? '#9CA3AF' : '#0A0A0C',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundImage:
                          p > 0
                            ? `linear-gradient(to right, #9CA3AF 0%, #9CA3AF ${p * 100}%, transparent ${p * 100}%, transparent 100%)`
                            : 'none',
                        backgroundPosition: '0 55%',
                        backgroundSize: '100% 1.5px',
                        backgroundRepeat: 'no-repeat',
                      }}
                    >
                      {todo.text}
                    </span>
                  </span>

                  <span style={deleteButton}>×</span>
                </div>
              );
            })
          )}
        </div>

        {footerNote ? (
          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              color: '#6B7280',
              opacity: footerNoteOpacity,
              textAlign: 'center',
            }}
          >
            {footerNote}
          </div>
        ) : null}
      </div>
    </div>
  );
}
