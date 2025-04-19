// utils/highlightText.jsx

export default function highlightText(text, terms) {
    if (!terms || terms.length === 0) return text;

    // Экранируем спецсимволы для RegExp (например, "+", "*", "[", "]")
    const escapedTerms = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, i) =>
        pattern.test(part) ? (
            <span key={i} style={{ backgroundColor: 'yellow' }}>{part}</span>
        ) : (
            part
        )
    );
}
