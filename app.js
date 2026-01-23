const tabs = document.querySelectorAll(".tab");
const editor = document.querySelector(".editor-content code");

const snippets = {
  "solver.ts": `const solver = BabaMath.configure({
  precision: "quantum",
  mode: "tensor",
});

export function optimize(signal) {
  const mesh = solver.fourierMesh(signal, 128000);
  return solver.gradientDescent(mesh, {
    decay: 0.0012,
    explain: true,
  });
}
`,
  "visualizer.swift": `import BabaVision

let view = QuantumCanvas(mode: .vector)
view.render(field: .curl) {
  $0.tint = .neon
  $0.grid = .dense
}
`,
  "notes.md": `# Session Notes

- Proved convergence with Lyapunov stability.
- Injected Fourier mesh for smooth gradients.
- Next: run 2D manifold visualization.`
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    const key = tab.textContent?.trim();
    if (key && snippets[key]) {
      editor.textContent = snippets[key];
    }
  });
});
