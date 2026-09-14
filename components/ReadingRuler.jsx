"use client";

import {useEffect, useRef, useState} from "react";

// A translucent horizontal band that dims everything except one line,
// helping the reader track their place. Two ways to move it:
//   1. Hover with a mouse over the text (desktop).
//   2. Drag the handle on the right edge (works with touch or mouse) -
//      this is the touch-friendly path, kept separate from the text itself
//      so dragging it doesn't fight the browser's normal scroll gesture.
//
// Wrap it directly around the text you want the ruler to apply to.
export default function ReadingRuler({children, height = 40, touchHeight = 64}) {
	const containerRef = useRef(null);
	const [y, setY] = useState(null);
	const [dragging, setDragging] = useState(false);
	const [isTouch, setIsTouch] = useState(false);

	function clampY(clientY) {
		const el = containerRef.current;
		if (!el) return null;
		const rect = el.getBoundingClientRect();
		return Math.max(0, Math.min(rect.height, clientY - rect.top));
	}

	// Mouse hovering directly over the text - desktop only, unchanged from
	// before. Dragging the handle (below) takes priority if active.
	function handleMouseMove(e) {
		if (dragging) return;
		setIsTouch(false);
		setY(clampY(e.clientY));
	}

	function handleMouseLeave() {
		if (!dragging) setY(null);
	}

	function startDrag(clientY, touch) {
		setDragging(true);
		setIsTouch(touch);
		setY(clampY(clientY));
	}

	// While dragging the handle, track the pointer at the window level so
	// the drag keeps working even if the finger/cursor moves outside the
	// narrow handle strip.
	useEffect(() => {
		if (!dragging) return;

		function onMove(e) {
			const clientY = e.touches ? e.touches[0].clientY : e.clientY;
			setY(clampY(clientY));
			// Stops the page from scrolling while actively dragging the handle.
			if (e.touches) e.preventDefault();
		}
		function onUp() {
			setDragging(false);
			// Deliberately NOT clearing y here: touch has no hover state, so
			// the ruler should stay put where it was released rather than
			// vanishing, otherwise it's unusable on a touchscreen.
		}

		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
		window.addEventListener("touchmove", onMove, {passive: false});
		window.addEventListener("touchend", onUp);
		return () => {
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseup", onUp);
			window.removeEventListener("touchmove", onMove);
			window.removeEventListener("touchend", onUp);
		};
	}, [dragging]);

	const bandHeight = isTouch ? touchHeight : height;

	return (
		<div ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{position: "relative"}}>
			{children}

			{y !== null && (
				<>
					<div
						aria-hidden="true"
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: Math.max(0, y - bandHeight / 2),
							background: "rgba(0, 0, 0, 0.35)",
							pointerEvents: "none",
							borderRadius: "12px 12px 0 0",
						}}
					/>
					<div
						aria-hidden="true"
						style={{
							position: "absolute",
							top: y + bandHeight / 2,
							left: 0,
							right: 0,
							bottom: 0,
							background: "rgba(0, 0, 0, 0.35)",
							pointerEvents: "none",
							borderRadius: "0 0 12px 12px",
						}}
					/>
				</>
			)}

			{/* Touch-friendly drag handle */}
			<div
				role="slider"
				aria-label="Reading ruler position"
				onMouseDown={(e) => startDrag(e.clientY, false)}
				onTouchStart={(e) => startDrag(e.touches[0].clientY, true)}
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					right: 4,
					width: 32,
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "center",
					cursor: "grab",
					touchAction: "none",
				}}
			>
				<div
					style={{
						width: 28,
						height: 44,
						borderRadius: 14,
						background: "rgba(255,255,255,0.9)",
						border: "1px solid rgba(0,0,0,0.15)",
						boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
						transform: `translateY(${y !== null ? Math.max(0, y - 22) : 8}px)`,
						transition: dragging ? "none" : "transform 0.15s",
					}}
				/>
			</div>
		</div>
	);
}
