// schema.org 구조화 데이터를 <script type="application/ld+json">로 렌더하는 서버
// 컴포넌트. "<"를 유니코드 이스케이프해 데이터에 우연히 섞인 마크업이 스크립트를
// 조기 종료(</script>)시키지 못하게 막는다. 최초 HTML에 그대로 들어간다.
export default function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
