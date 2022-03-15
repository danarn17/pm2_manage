(function ($, window, document) {
  $(async function () {
    function getStatusBadge(status) {
      switch (status) {
        case "stopped":
          return `<span class="badge badge-danger">${status}</span>`;
        case "online":
          return `<span class="badge badge-success">${status}</span>`;
        default:
          return `<span class="badge badge-default">${status}</span>`;
      }
    }

    function getActionButton(status) {
      if (status === "online") {
        return `
              <button type="button" class="btn btn-outline-danger" data-action="stop" title="stop">
                <i class="bi bi-pause-circle"></i>
              </button>
          `;
      }
      return `
              <button type="button" class="btn btn-outline-primary" data-action="start" title="start">
                <i class="bi bi-play-circle"></i>
              </button>
          `;
    }

    async function updateMinersStatus() {
      const response = await fetch("/miners");
      const miners = await response.json();

      const trs = [];
      for (const miner of miners) {
        trs.push(`
              <tr id="${miner.name}">
                    <td>${miner.name}</td>
                    <td>${getStatusBadge(miner.pm2_env.status)}</td>
                    <td>
                        <div class="btn-group">
                            <button type="button" class="btn btn-default btn-sm">
                              CPU: ${miner.monit ? miner.monit.cpu : "N/A"}
                            </button>
                            <button type="button" class="btn btn-default btn-sm">
                              RAM: ${
                                miner.monit
                                  ? (
                                      miner.monit.memory /
                                      (1024 * 1024)
                                    ).toFixed(1) + " MB"
                                  : "N/A"
                              }
                            </button>
                          </div>
                    </td>
                    <td>
                        ${getActionButton(miner.pm2_env.status)}
                        <button type="button" class="btn btn-outline-success" data-action="restart" title="restart">
                          <i class="bi bi-arrow-repeat"></i>
                        </button>
                    </td>
                </tr>
            `);
      }

      $("#tbl-miners tbody").html(trs.join(""));
    }

    updateMinersStatus();

    setInterval(() => {
      updateMinersStatus();
    }, 15 * 1000);

    $(document).on("click", "button", async function () {
      const self = $(this);
      const action = self.data("action");
      const process = self.parents("tr").attr("id");

      if (
        action &&
        process &&
        ["start", "stop", "restart"].indexOf(action) >= 0
      ) {
        try {
          const response = await fetch(`/miners/${process}/${action}`, {
            method: "PUT",
          });
          const data = await response.json();
          if (response.status !== 200) {
            throw new Error(data.message);
          }
          updateMinersStatus();
        } catch (error) {
          alert(error.message);
        }
      }
    });
  });
})(window.jQuery, window, document);
