interface Props {
  completed: number
  total: number
}

function ProgressGraph({ completed, total }: Props) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="progress-graph">
      <div className="progress-header">
        <span>Today's progress</span>
        <span>{percent}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="progress-label">{completed} of {total} tasks completed</p>
    </div>
  )
}

export default ProgressGraph
