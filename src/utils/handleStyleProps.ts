// allow for quick n easy styling through props

export type StyleProps = {
	class?: string;
	style?: Record<string, any>;
	p?: string | number;
	pt?: string | number;
	pb?: string | number;
	pl?: string | number;
	pr?: string | number;
	px?: string | number;
	py?: string | number;
	m?: string | number;
	mt?: string | number;
	mb?: string | number;
	ml?: string | number;
	mr?: string | number;
	mx?: string | number;
	my?: string | number;
	mxw?: string | number;
	mnw?: string | number;
	mxh?: string | number;
	mnh?: string | number;
	fz?: string | number;
};

export const resolveUnit = (measurement: string | number) =>
	typeof measurement === 'string' ? measurement : `${measurement}px`;

export const handleStyleProps = (props: StyleProps) => {
	const styles: Record<string, string> = {};

	// padding handled
	if (props.p !== undefined) {
		styles.padding = resolveUnit(props.p);
	}
	if (props.pt !== undefined) {
		styles.paddingTop = resolveUnit(props.pt);
	}
	if (props.pb !== undefined) {
		styles.paddingBottom = resolveUnit(props.pb);
	}
	if (props.pl !== undefined) {
		styles.paddingLeft = resolveUnit(props.pl);
	}
	if (props.pr !== undefined) {
		styles.paddingRight = resolveUnit(props.pr);
	}
	if (props.px !== undefined) {
		styles.paddingLeft = resolveUnit(props.px);
		styles.paddingRight = resolveUnit(props.px);
	}
	if (props.py !== undefined) {
		styles.paddingTop = resolveUnit(props.py);
		styles.paddingBottom = resolveUnit(props.py);
	}

	// margin handled
	if (props.m !== undefined) {
		styles.margin = resolveUnit(props.m);
	}
	if (props.mt !== undefined) {
		styles.marginTop = resolveUnit(props.mt);
	}
	if (props.mb !== undefined) {
		styles.marginBottom = resolveUnit(props.mb);
	}
	if (props.ml !== undefined) {
		styles.marginLeft = resolveUnit(props.ml);
	}
	if (props.mr !== undefined) {
		styles.marginRight = resolveUnit(props.mr);
	}
	if (props.mx !== undefined) {
		styles.marginLeft = resolveUnit(props.mx);
		styles.marginRight = resolveUnit(props.mx);
	}
	if (props.my !== undefined) {
		styles.marginTop = resolveUnit(props.my);
		styles.marginBottom = resolveUnit(props.my);
	}

	// handle fontsize
	if (props.fz !== undefined) {
		styles.fontSize = resolveUnit(props.fz);
	}

	// handle min/max width/height
	if (props.mxw !== undefined) {
		styles.maxWidth = resolveUnit(props.mxw);
	}
	if (props.mnw !== undefined) {
		styles.maxWidth = resolveUnit(props.mnw);
	}
	if (props.mxh !== undefined) {
		styles.maxWidth = resolveUnit(props.mxh);
	}
	if (props.mnh !== undefined) {
		styles.maxWidth = resolveUnit(props.mnh);
	}

	return styles;
};
