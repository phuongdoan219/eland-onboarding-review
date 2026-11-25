(function () {
  'use strict';

  const issueGroups = [
    ['Âm thanh / video', [
      'Không nghe được âm thanh', 'Nội dung âm thanh / video không đúng',
      'Âm thanh / video quá nhanh', 'Âm thanh / video quá chậm',
      'Âm thanh / video không phát hoặc bị đứng',
    ]],
    ['Nội dung câu hỏi / bài tập', [
      'Nội dung câu hỏi bị sai', 'Nội dung đáp án bị sai', 'Hình ảnh không phù hợp với bài',
      'Bài quá khó', 'Bài quá dễ', 'Nghi ngờ chấm sai',
    ]],
    ['Thao tác trong bài / tiến độ học', [
      'Không chọn / nhập / kéo được đáp án', 'Không chuyển được câu',
      'Không tiếp tục / hoàn thành được bài', 'Bài học bị đứng hoặc tự thoát',
      'Kết quả học chưa được lưu', 'Bài đã học bị mất tiến độ', 'Không mở được bài hoặc Unit',
    ]],
    ['Hướng dẫn / giao diện', [
      'Không biết bắt đầu học hoặc làm bước tiếp theo', 'Hướng dẫn / câu chữ khó hiểu',
      'Giao diện khó nhìn hoặc khó sử dụng', 'Hình hoặc chữ bị mất / hiển thị lỗi', 'Trang trắng / bố cục bị vỡ',
    ]],
    ['Tài khoản / thanh toán / gói học', [
      'Không đăng nhập được', 'Thông tin tài khoản không đúng', 'Không thanh toán được',
      'Đã mua gói nhưng chưa học được', 'Thông tin giá / gói học chưa rõ',
    ]],
    ['Tải trang', ['Trang không tải hoặc tải chậm']],
    ['Vấn đề khác', ['Không rõ lỗi gì', 'Đề xuất cải thiện tính năng']],
  ];
  const plans = [
    ['Khởi động', '3 tháng', '289.000₫', '419.000₫'],
    ['Tự tin', '1 năm', '499.000₫', '1.299.000₫'],
    ['Cơ bản', '6 tháng', '329.000₫', '579.000₫'],
  ];
  const photoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const pricingUrl = 'https://eland.edu.vn/pricing?from=map_menu';

  function bind(openDialog) {
    const reportTrigger = document.querySelector('#map-report-open');
    const pricingTrigger = document.querySelector('#map-pricing-open');
    const body = document.querySelector('#dialog-body');
    const draft = { issue: '', description: '', photo: null };

    reportTrigger.addEventListener('click', () => {
      const options = issueGroups.map(([label, items]) => (
        `<optgroup label="${label}">${items.map(issue => `<option>${issue}</option>`).join('')}</optgroup>`
      )).join('');
      openDialog('map-report', 'Báo sự cố', '', `
        <form class="map-report-form">
          <label for="map-report-issue">Bạn gặp vấn đề gì?
            <select id="map-report-issue" required>
              <option value="">Chọn vấn đề</option>
              ${options}
            </select>
          </label>
          <div>
            <label for="map-report-description">Mô tả thêm <span class="map-report-optional">(không bắt buộc)</span>
              <textarea id="map-report-description" maxlength="500" rows="3" aria-describedby="map-report-count"></textarea>
            </label>
            <output id="map-report-count" class="map-report-counter">0/500</output>
          </div>
          <div class="map-report-attachment">
            <label class="map-report-upload">Thêm ảnh
              <input type="file" accept="image/jpeg,image/png,image/webp">
            </label>
            <span class="map-report-file"></span>
            <button type="button" class="map-report-remove" hidden>Xóa ảnh</button>
          </div>
          <button class="primary" type="submit" disabled>Gửi</button>
          <p class="map-report-status" role="status"></p>
        </form>
      `);
      const form = body.querySelector('form');
      const issue = form.querySelector('select');
      const description = form.querySelector('textarea');
      const count = form.querySelector('output');
      const fileInput = form.querySelector('input[type="file"]');
      const fileName = form.querySelector('.map-report-file');
      const remove = form.querySelector('.map-report-remove');
      const send = form.querySelector('button[type="submit"]');
      const status = form.querySelector('.map-report-status');

      function updatePhoto() {
        fileName.textContent = draft.photo?.name || '';
        remove.hidden = !draft.photo;
      }
      issue.value = draft.issue;
      description.value = draft.description;
      send.disabled = !draft.issue;
      count.textContent = draft.description.length + '/500';
      updatePhoto();
      issue.focus();

      issue.addEventListener('change', () => {
        draft.issue = issue.value;
        send.disabled = !draft.issue;
        status.textContent = '';
      });
      description.addEventListener('input', () => {
        draft.description = description.value;
        count.textContent = draft.description.length + '/500';
        status.textContent = '';
      });
      fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (!file) return;
        if (!photoTypes.has(file.type)) {
          fileInput.value = '';
          status.textContent = 'Chọn ảnh JPEG, PNG hoặc WebP.';
          return;
        }
        draft.photo = file;
        updatePhoto();
        status.textContent = '';
      });
      remove.addEventListener('click', () => {
        draft.photo = null;
        fileInput.value = '';
        updatePhoto();
        status.textContent = '';
        fileInput.focus();
      });
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!draft.issue) return;
        status.textContent = 'Báo cáo chưa được gửi trên trang này.';
      });
    });

    pricingTrigger.addEventListener('click', () => {
      const items = plans.map(([name, duration, price, listPrice]) => (
        `<li><b>${name}</b><span>${duration}</span><strong>${price}</strong><s>${listPrice}</s></li>`
      )).join('');
      openDialog('map-pricing', 'Gói học', '', `
        <ul class="map-pricing-plans">${items}</ul>
        <p>Mọi gói đều mở đầy đủ chức năng, khác nhau về thời hạn.</p>
        <a class="map-pricing-link" href="${pricingUrl}" target="_blank" rel="noopener noreferrer">Xem gói học trên ELand</a>
      `);
    });
  }

  window.ELandMapActions = { bind };
})();
