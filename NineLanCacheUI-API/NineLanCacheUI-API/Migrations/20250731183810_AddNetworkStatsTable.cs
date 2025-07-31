using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NineLanCacheUI_API.Migrations
{
    /// <inheritdoc />
    public partial class AddNetworkStatsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Stats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    InterfaceName = table.Column<string>(type: "TEXT", nullable: false),
                    BytesSentPerSec = table.Column<long>(type: "INTEGER", nullable: false),
                    BytesReceivedPerSec = table.Column<long>(type: "INTEGER", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stats", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Stats_InterfaceName",
                table: "Stats",
                column: "InterfaceName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Stats");
        }
    }
}
