using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NineLanCacheUI_API.Migrations
{
    /// <inheritdoc />
    public partial class AddExcludedIps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExcludedIps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IpAddress = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExcludedIps", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExcludedIps_IpAddress",
                table: "ExcludedIps",
                column: "IpAddress",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExcludedIps");
        }
    }
}
