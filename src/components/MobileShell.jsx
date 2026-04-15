import styles from './MobileShell.module.css'

export default function MobileShell({ children }) {
  return (
    <div className={styles.shell}>
      <div className={styles.device}>
        {children}
      </div>
    </div>
  )
}
