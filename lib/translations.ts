export const translations = {
  vi: {
    nav: { memories: "Kỷ niệm", prompts: "Câu hỏi", bucketList: "Ước nguyện", settings: "Cài đặt" },
    dashboard: { daysTogether: "Đã bên nhau", day: "ngày", emptyState: "Hãy chọn một tính năng bên trái nhé" },
    profile: { edit: "Chỉnh sửa hồ sơ", logout: "Đăng xuất", unpair: "Huỷ ghép đôi", moodTitle: "Cập nhật tâm trạng", partnerMood: "{name} đang cảm thấy {mood}" },
    unpairModal: {
      confirmTitle: "Huỷ ghép đôi?", confirmDesc: "Hành động này sẽ gửi yêu cầu huỷ không gian chung đến đối phương. Bạn có chắc không?", btnCancel: "Huỷ", btnConfirm: "Chắc chắn",
      sentTitle: "Đã gửi yêu cầu", sentDesc: "Yêu cầu đã được gửi đi. Cùng chờ đối phương phản hồi nhé!", btnUnderstand: "Đã hiểu",
      receiveTitle: "Lời chia tay?", receiveDesc: "Đối phương muốn huỷ không gian chung này. Bạn có đồng ý rời đi không?", btnReject: "Không đồng ý", btnAccept: "Đồng ý"
    },
    expBar: { anniversary: "Kỷ niệm", year: "năm", daysLeft: "Còn {count} ngày" },
    bucketList: { title: "Danh sách ước nguyện", progress: "Tiến độ thực hiện", placeholder: "Hai đứa mình sẽ cùng làm gì tiếp theo?", loading: "Đang tải..." },
    dailyPrompt: {
      title: "Câu hỏi hôm nay", aiThinking: 'Đang nhờ AI suy nghĩ câu hỏi...', partnerAnswered: "Câu trả lời của {name}", partnerNotAnswered: "Người ấy chưa trả lời câu hỏi hôm nay...",
      hiddenAnswer: "Nội dung đã bị ẩn đi một cách đầy bí ẩn... Người ấy đang chờ bạn đó!", replyToSee: "Trả lời để xem", yourAnswer: "Câu trả lời của bạn", placeholder: "Nhập suy nghĩ của bạn vào đây...", btnSubmitting: "Đang gửi...", btnSubmit: "Gửi câu trả lời"
    },
    memoryTimeline: {
      title: "Kỷ niệm", loading: "Đang tải...", empty: "Chưa có kỷ niệm nào.", loadMore: "Tải thêm", addEditTitle: "Thêm kỷ niệm mới", editTitle: "Cập nhật kỷ niệm",
      imageLabel: "Ảnh (Tối đa 10 ảnh)", clickToUpload: "Bấm để tải ảnh lên", titlePlaceholder: "Tiêu đề...", locationPlaceholder: "Địa điểm (Tuỳ chọn)", descPlaceholder: "Kể lại câu chuyện...",
      btnCancel: "Hủy", btnSave: "Lưu lại", btnUpdate: "Cập nhật", btnSaving: "Đang lưu...", deleteTitle: "Xóa kỷ niệm", deleteDesc: "Bạn có chắc chắn muốn xóa kỷ niệm này không? Hành động này không thể hoàn tác.", btnDelete: "Xóa luôn",
      maxImagesError: "Chỉ được chọn tối đa 10 ảnh!"
    },
    settingsModal: { title: "Cài đặt", startDate: "Ngày bắt đầu", themeColor: "Màu sắc chủ đề", hexCode: "Mã màu: {color}", btnSave: "Lưu", btnSaving: "Đang lưu..." },
    singleDashboard: {
      toastSelf: "Bạn không thể kết đôi với chính mình!", toastSuccess: "Đã gửi lời mời ghép đôi thành công", toastError: "Gửi lời mời thất bại!",
      welcomeTitle: "Chào mừng, {name}!", emptyTitle: 'Trông bạn thật trống trải...', emptyDesc: 'Hãy ghép đôi để cùng nhau xây dựng tổ ấm nhỏ nhé.', myIdLabel: 'Mã số ID của bạn:', inputPartnerIdPlaceholder: 'Nhập mã số ID đối phương (8 số)...',
      inputMessagePlaceholder: 'Nhập câu tỏ tình hoặc lời mời (không bắt buộc)...', btnAccept: 'Đồng ý', btnReject: 'Từ chối',
      btnInvite: 'Gửi lời mời kết đôi', inviteModalHeader: 'Hộp thư lời mời', waitingPartner: 'Đang đợi nửa kia kết nối...', waitingPartnerDesc: 'Gửi mã số ID cho đối phương hoặc chủ động điền mã của họ bên cột trái nhé!',
      youHaveInvite: 'Bạn nhận được lời mời!', acceptDescription: 'Mở cánh cửa để cùng nhau xây dựng thế giới riêng nào.', labelUS: "English", labelVI: "Tiếng Việt", labelNotif: "Thông báo"
    },
    auth: {
      verifyEmail: "Xác thực Email", login: "Đăng nhập", register: "Tạo tài khoản", otpSentTo: "Chúng mình đã gửi mã gồm 6 số đến", placeholderOTP: "------",
      btnVerifying: "Đang kiểm tra...", btnConfirmOTP: "Xác Nhận OTP", btnBack: "← Quay lại", labelName: "Tên hiển thị", placeholderName: "Ví dụ: Hoàng tử",
      labelEmail: "Email", placeholderEmail: "email@gmail.com", labelPass: "Mật khẩu", placeholderPass: "••••••••", strengthLabels: ['Quá ngắn', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'],
      labelConfirmPass: "Nhập lại mật khẩu", btnProcessing: "Đang xử lý...", btnLogin: "Đăng nhập", btnRegister: "Đăng ký", switchRegister: "Chưa có tài khoản? Đăng ký", switchLogin: "Đã có tài khoản? Đăng nhập",
      msgUnverified: "Tài khoản này chưa được xác minh OTP!", msgWrongCreds: "Email hoặc mật khẩu không đúng!", msgPassMismatch: "Mật khẩu nhập lại không khớp!",
      msgWeakPass: "Mật khẩu của bạn hơi yếu, hãy thêm số hoặc độ dài nhé!", msgEmailInUse: "Email này đã được sử dụng!", msgError: "Có lỗi xảy ra, vui lòng thử lại!",
      msgOtpSent: "Mã OTP 6 số đã được gửi vào Email của bạn!", msgOtpInvalid: "Mã xác nhận không đúng hoặc đã hết hạn!", msgOtpSuccess: "Xác nhận thành công! Đang đăng nhập...",
      forgotPassword: "Quên mật khẩu?", resetPassTitle: "Khôi phục mật khẩu", enterEmailToReset: "Nhập email của bạn để nhận mã khôi phục.",
      btnSendReset: "Gửi mã khôi phục", msgResetSent: "Mã khôi phục đã được gửi đến email của bạn!", labelNewPass: "Mật khẩu mới",
      btnUpdatePass: "Cập nhật mật khẩu", msgPassUpdated: "Cập nhật mật khẩu thành công! Đang vào nhà chung...", msgRecoveryInvalid: "Mã khôi phục không đúng hoặc đã hết hạn!"
    },
    profileModal: {
      title: "Cập nhật Hồ Sơ", changePhoto: "Đổi ảnh", labelName: "Tên hiển thị", placeholderName: "Nhập tên của bạn", labelDob: "Ngày sinh", btnCancel: "Hủy", btnSaving: "Đang lưu...", btnSave: "Lưu Hồ Sơ",
      zodiacs: ["Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải", "Sư Tử", "Xử Nữ", "Thiên Bình", "Bọ Cạp", "Nhân Mã", "Ma Kết", "Bảo Bình", "Song Ngư"]
    },
    avatarPlayer: {
      loading: "Đang tải...", unknownZodiac: "Chưa rõ", age: "{age} tuổi", unknownAge: "???",
      zodiacNames: ["Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải", "Sư Tử", "Xử Nữ", "Thiên Bình", "Bọ Cạp", "Nhân Mã", "Ma Kết", "Bảo Bình", "Song Ngư"]
    },
    introScreen: {
      loginBtn: 'Đăng nhập',titleLine1: 'Lưu giữ tình yêu', titleLine2: 'hoàn hảo nhất', description: 'Không gian kỹ thuật số sang trọng dành riêng cho hai bạn. Nơi đếm những ngày yêu, lưu trữ kỷ niệm và cùng nhau viết lên những ước nguyện tương lai.',
      startBtn: 'Bắt đầu hành trình', githubBtn: 'Star on Github', daysTogether: 'Đã bên nhau', days: 'ngày', newMemory: 'Kỷ niệm mới', justUploaded: 'Vừa được tải lên'
    }
  },
  en: {
    nav: { memories: "Memories", prompts: "Prompts", bucketList: "Bucket List", settings: "Settings" },
    dashboard: { daysTogether: "Days Together", day: "days", emptyState: "Select a feature on the left" },
    profile: { edit: "Edit Profile", logout: "Logout", unpair: "Unpair", moodTitle: "Update Mood", partnerMood: "{name} is feeling {mood}" },
    unpairModal: {
      confirmTitle: "Unpair?", confirmDesc: "This will send an unpairing request to your partner. Are you sure?", btnCancel: "Cancel", btnConfirm: "Confirm",
      sentTitle: "Request Sent", sentDesc: "Request sent. Waiting for your partner's response!", btnUnderstand: "Understood",
      receiveTitle: "Farewell?", receiveDesc: "Your partner wants to close this shared space. Do you agree to leave?", btnReject: "Reject", btnAccept: "Accept"
    },
    expBar: { anniversary: "Anniversary", year: "years", daysLeft: "{count} days left" },
    bucketList: { title: "Bucket List", progress: "Progress", placeholder: "What will we do next?", loading: "Loading..." },
    dailyPrompt: {
      title: "Today's Prompt", aiThinking: "Asking AI for a question...", partnerAnswered: "{name}'s answer", partnerNotAnswered: "Your partner hasn't answered today's prompt yet...",
      hiddenAnswer: "The content is mysteriously hidden... Your partner is waiting for you!", replyToSee: "Reply to see", yourAnswer: "Your Answer", placeholder: "Type your thoughts here...", btnSubmitting: "Sending...", btnSubmit: "Submit answer"
    },
    memoryTimeline: {
      title: "Memories", loading: "Loading...", empty: "No memories yet.", loadMore: "Load more", addEditTitle: "Add new memory", editTitle: "Update memory",
      imageLabel: "Images (Max 10)", clickToUpload: "Click to upload", titlePlaceholder: "Title...", locationPlaceholder: "Location (Optional)", descPlaceholder: "Tell the story...",
      btnCancel: "Cancel", btnSave: "Save", btnUpdate: "Update", btnSaving: "Saving...", deleteTitle: "Delete memory", deleteDesc: "Are you sure you want to delete this memory? This action cannot be undone.", btnDelete: "Delete",
      maxImagesError: "You can only select up to 10 images!"
    },
    settingsModal: { title: "Settings", startDate: "Start Date", themeColor: "Theme Color", hexCode: "Hex Code: {color}", btnSave: "Save", btnSaving: "Saving..." },
    singleDashboard: {
      toastSelf: "You cannot pair with yourself!", toastSuccess: "Pairing invitation sent successfully", toastError: "Failed to send pairing invitation!",
      welcomeTitle: "Welcome, {name}!", emptyTitle: 'It looks pretty empty...', emptyDesc: 'Pair up to start building your little world together.', myIdLabel: 'Your ID:', inputPartnerIdPlaceholder: 'Enter partner ID (8 digits)...',
      inputMessagePlaceholder: 'Enter a love confession or invitation message (optional)...', btnAccept: 'Accept', btnReject: 'Reject',
      btnInvite: 'Send Pairing Invitation', inviteModalHeader: 'Pairing Invitation Inbox', waitingPartner: 'Waiting for your partner to connect...', waitingPartnerDesc: 'Share your ID with your partner or proactively enter their ID on the left column!',
      youHaveInvite: 'You have a pairing invitation!', acceptDescription: 'Open the door to build your private world together.', labelUS: "English", labelVI: "Tiếng Việt", labelNotif: "Notifications"
    },
    auth: {
      verifyEmail: "Verify Email", login: "Log in", register: "Create Account", otpSentTo: "We sent a 6-digit code to", placeholderOTP: "------",
      btnVerifying: "Verifying...", btnConfirmOTP: "Confirm OTP", btnBack: "← Go back", labelName: "Display Name", placeholderName: "E.g. Tung Duong",
      labelEmail: "Email", placeholderEmail: "email@gmail.com", labelPass: "Password", placeholderPass: "••••••••", strengthLabels: ['Too short', 'Weak', 'Fair', 'Strong', 'Very Strong'],
      labelConfirmPass: "Confirm Password", btnProcessing: "Processing...", btnLogin: "Log in", btnRegister: "Sign up", switchRegister: "Don't have an account? Sign up", switchLogin: "Already have an account? Log in",
      msgUnverified: "This account has not been verified!", msgWrongCreds: "Incorrect email or password!", msgPassMismatch: "Passwords do not match!",
      msgWeakPass: "Your password is too weak, please add numbers or length!", msgEmailInUse: "This email is already in use!", msgError: "An error occurred, please try again!",
      msgOtpSent: "A 6-digit OTP has been sent to your Email!", msgOtpInvalid: "Invalid or expired confirmation code!", msgOtpSuccess: "Verification successful! Logging in...",
      forgotPassword: "Forgot password?", resetPassTitle: "Reset Password", enterEmailToReset: "Enter your email to receive a reset code.",
      btnSendReset: "Send reset code", msgResetSent: "A reset code has been sent to your email!", labelNewPass: "New Password",
      btnUpdatePass: "Update Password", msgPassUpdated: "Password updated successfully! Logging in...", msgRecoveryInvalid: "Invalid or expired recovery code!"
    },
    profileModal: {
      title: "Update Profile", changePhoto: "Change", labelName: "Display Name", placeholderName: "Enter your name", labelDob: "Date of Birth", btnCancel: "Cancel", btnSaving: "Saving...", btnSave: "Save Profile",
      zodiacs: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    },
    avatarPlayer: {
      loading: "Loading...", unknownZodiac: "Unknown", age: "{age} yrs", unknownAge: "???",
      zodiacNames: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    },
    introScreen: {
      loginBtn: 'Log in', titleLine1: 'Preserve your love', titleLine2: 'in the most perfect way', description: 'A luxurious digital space just for two. Where you can count the days, store memories, and write future wishes together.',
      startBtn: 'Start your journey', githubBtn: 'Star on Github', daysTogether: 'Days Together', days: 'days', newMemory: 'New Memory', justUploaded: 'Just uploaded'
    }
  }
};

export type Locale = 'vi' | 'en';