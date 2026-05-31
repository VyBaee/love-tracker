import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Chưa cài GEMINI_API_KEY trong file .env.local" }, { status: 400 });
    }

    // ==========================================
    // BƯỚC 1: LẤY DANH SÁCH TẤT CẢ MODELS ĐANG CÓ
    // ==========================================
    const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!modelsRes.ok) {
      throw new Error("Không thể lấy danh sách models từ Google");
    }
    const modelsData = await modelsRes.json();

    // Lọc ra các model xịn của Gemini có hỗ trợ tạo chữ (generateContent)
    const validModels = modelsData.models
      .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent') && m.name.includes('gemini'))
      .map((m: any) => m.name.replace('models/', '')); // Cắt bớt chữ "models/" để URL không bị lặp

    if (validModels.length === 0) {
      throw new Error("Tài khoản này không có con AI nào hỗ trợ tạo văn bản!");
    }

    console.log("🔍 Đã tìm thấy các Model hợp lệ:", validModels);

    const prompt = "Hãy đóng vai một chuyên gia tâm lý tình yêu. Viết 1 câu hỏi ngắn gọn, lãng mạn, sâu sắc hoặc hài hước, đôi lúc đánh sâu vào tâm lý cá nhân dành cho các cặp đôi yêu nhau để họ trả lời hàng ngày, lưu ý những ngày kỉ niệm để đặt câu hỏi phù hợp với ngữ cảnh. Chỉ trả về đúng 1 câu hỏi, không giải thích gì thêm. Không dùng ngoặc kép. Tối đa 20 chữ.";

    let finalQuestion = null;
    let lastError = null;

    // ==========================================
    // BƯỚC 2: AUTO TEST TỪNG MODEL CHO ĐẾN KHI THÀNH CÔNG
    // ==========================================
    for (const modelName of validModels) {
      console.log(`⏳ Đang test thử độ phản hồi của: ${modelName}...`);
      
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9 }
          })
        });

        const data = await response.json();

        // Nếu gọi thành công và có chữ trả về
        if (response.ok && data.candidates && data.candidates.length > 0) {
          finalQuestion = data.candidates[0].content.parts[0].text.trim();
          console.log(`✅ CHỐT ĐƠN! Model [${modelName}] đã trả lời thành công!`);
          break; // Tìm được rồi thì DỪNG vòng lặp, không test mấy con sau nữa
        } else {
          lastError = data.error?.message || "Phản hồi trống";
          console.log(`❌ Model [${modelName}] tịt ngòi: ${lastError}`);
        }
      } catch (e: any) {
        console.log(`❌ Model [${modelName}] lỗi mạng: ${e.message}`);
      }
    }

    // ==========================================
    // BƯỚC 3: TRẢ KẾT QUẢ VỀ CHO GIAO DIỆN MÀN HÌNH
    // ==========================================
    if (finalQuestion) {
      return NextResponse.json({ question: finalQuestion });
    } else {
      return NextResponse.json({ error: `Đã tự động test toàn bộ danh sách AI nhưng đều thất bại. Lỗi của con cuối cùng: ${lastError}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Lỗi Server API Route:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}