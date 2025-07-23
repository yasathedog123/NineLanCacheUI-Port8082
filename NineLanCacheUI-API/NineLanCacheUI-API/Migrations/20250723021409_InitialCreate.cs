using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NineLanCacheUI_API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DownloadEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CacheIdentifier = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DownloadIdentifier = table.Column<long>(type: "bigint", nullable: true),
                    DownloadIdentifierString = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClientIp = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CacheHitBytes = table.Column<long>(type: "bigint", nullable: false),
                    CacheMissBytes = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DownloadEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    Key = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "SteamDepots",
                columns: table => new
                {
                    SteamDepotId = table.Column<long>(type: "bigint", nullable: false),
                    SteamAppId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SteamDepots", x => new { x.SteamDepotId, x.SteamAppId });
                });

            migrationBuilder.CreateTable(
                name: "SteamManifests",
                columns: table => new
                {
                    DepotId = table.Column<long>(type: "bigint", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalCompressedSize = table.Column<decimal>(type: "decimal(20,0)", nullable: false),
                    TotalUncompressedSize = table.Column<decimal>(type: "decimal(20,0)", nullable: false),
                    UniqueManifestIdentifier = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ManifestBytesSize = table.Column<decimal>(type: "decimal(20,0)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SteamManifests", x => new { x.DepotId, x.CreationTime });
                });

            migrationBuilder.CreateIndex(
                name: "IX_DownloadEvents_CacheIdentifier",
                table: "DownloadEvents",
                column: "CacheIdentifier");

            migrationBuilder.CreateIndex(
                name: "IX_DownloadEvents_ClientIp",
                table: "DownloadEvents",
                column: "ClientIp");

            migrationBuilder.CreateIndex(
                name: "IX_SteamManifests_UniqueManifestIdentifier",
                table: "SteamManifests",
                column: "UniqueManifestIdentifier",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DownloadEvents");

            migrationBuilder.DropTable(
                name: "Settings");

            migrationBuilder.DropTable(
                name: "SteamDepots");

            migrationBuilder.DropTable(
                name: "SteamManifests");
        }
    }
}
